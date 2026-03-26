package com.hutech.quiz.controller;

import com.hutech.quiz.model.GameRoom;
import com.hutech.quiz.model.Quiz;
import com.hutech.quiz.repository.GameRoomRepository;
import com.hutech.quiz.repository.QuizRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Game Room Management", description = "APIs for multiplayer room creation and participation")
public class GameRoomController {

    private final GameRoomRepository gameRoomRepository;
    private final QuizRepository quizRepository;

    // WebSocket template: dùng để broadcast trạng thái phòng tới tất cả client đang lắng nghe
    private final SimpMessagingTemplate messagingTemplate;

    // ─────────────────────────────────────────────────────────────────────────────
    // CƠ CHẾ CHỐNG DISCONNECT / LAG MẠNG
    // Mỗi phòng có một Timer chạy trên SERVER.
    // Dù client bị mất mạng hay tắt trình duyệt, server vẫn tự động chuyển câu
    // hỏi sau 10 giây mà không cần client gửi tín hiệu. Điều này đảm bảo trận
    // đấu tiếp tục ngay cả khi có người bị ngắt kết nối đột ngột.
    // ─────────────────────────────────────────────────────────────────────────────
    private final Map<String, ScheduledFuture<?>> roomTimers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    // ─────────────────────────────────────────────────────────────────────────────
    // TẠO PHÒNG THI ĐẤU
    // PIN 6 chữ số được sinh ngẫu nhiên, đảm bảo mỗi phòng có mã định danh duy nhất.
    // lastActiveAt được cập nhật ngay khi tạo, phục vụ cơ chế tự dọn phòng rác.
    // ─────────────────────────────────────────────────────────────────────────────
    @PostMapping("/create")
    @Operation(summary = "Create a multiplayer game room")
    public ResponseEntity<GameRoom> createRoom(@RequestParam String hostId, @RequestParam String hostName,
            @RequestParam String quizId) {
        String pin = String.format("%06d", new Random().nextInt(999999));
        GameRoom.Player host = new GameRoom.Player(hostId, hostName, 0, true);
        List<GameRoom.Player> players = new ArrayList<>();
        players.add(host);

        GameRoom room = GameRoom.builder()
                .pin(pin)
                .hostId(hostId)
                .quizId(quizId)
                .players(players)
                .status("WAITING")
                .lastActiveAt(new Date()) // Ghi lại thời điểm hoạt động cuối để cleanup service sử dụng
                .build();
        return ResponseEntity.ok(gameRoomRepository.save(room));
    }

    @GetMapping("/{pin}")
    @Operation(summary = "Get room by PIN")
    public ResponseEntity<GameRoom> getRoomByPin(@PathVariable String pin) {
        return gameRoomRepository.findByPin(pin)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CHỐNG GIAN LẬN: NGĂN VÀO PHÒNG TRÙNG USER
    // Trước khi thêm player, server kiểm tra xem userId đã tồn tại trong phòng
    // chưa (dòng "boolean exists = ..."). Nếu đã có → bỏ qua, không thêm trùng.
    // Điều này ngăn người chơi vào cùng phòng với 2 tab/thiết bị khác nhau.
    // ─────────────────────────────────────────────────────────────────────────────
    @PostMapping("/{pin}/join")
    @Operation(summary = "Join a room")
    public ResponseEntity<GameRoom> joinRoom(@PathVariable String pin, @RequestParam String userId,
            @RequestParam String username) {
        return gameRoomRepository.findByPin(pin).map(room -> {
            if (room.getPlayers() == null) {
                room.setPlayers(new ArrayList<>());
            }
            // ANTI-CHEAT: Kiểm tra userId đã có trong phòng chưa, nếu có thì không thêm mới
            boolean exists = room.getPlayers().stream().anyMatch(p -> p.getUserId().equals(userId));
            if (!exists) {
                GameRoom.Player player = new GameRoom.Player(userId, username, 0, true);
                room.getPlayers().add(player);
                room.setLastActiveAt(new Date());
                gameRoomRepository.save(room);
            }
            // Broadcast cập nhật danh sách người chơi cho mọi client trong phòng
            messagingTemplate.convertAndSend("/topic/room/" + pin, room);
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // BẮT ĐẦU GAME: KHỞI ĐỘNG TIMER SERVER-SIDE
    // - Server SET timerEndTime = currentTime + 10s → client nhìn vào để hiển thị
    // - Server tự SCHEDULE chuyển câu sau 10s, KHÔNG phụ thuộc client còn kết nối
    // - frozenUserIds được reset về rỗng trước mỗi lượt mới
    // ─────────────────────────────────────────────────────────────────────────────
    @PostMapping("/{pin}/start")
    @Operation(summary = "Start the game")
    public ResponseEntity<GameRoom> startGame(@PathVariable String pin) {
        return gameRoomRepository.findByPin(pin)
                .map(room -> {
                    Quiz quiz = quizRepository.findById(room.getQuizId()).orElse(null);
                    if (quiz == null)
                        return ResponseEntity.badRequest().<GameRoom>build();

                    room.setStatus("STARTED");
                    room.setCurrentQuestionIndex(0);
                    room.setTotalQuestions(quiz.getQuestions().size());
                    room.setFrozenUserIds(new ArrayList<>()); // Reset danh sách bị freeze trước mỗi câu
                    room.setTimerEndTime(System.currentTimeMillis() + 10000); // Đặt thời điểm kết thúc câu hỏi
                    room.setLastActiveAt(new Date());
                    gameRoomRepository.save(room);

                    // Broadcast trạng thái STARTED tới tất cả client trong phòng
                    messagingTemplate.convertAndSend("/topic/room/" + pin, room);

                    // Lên lịch tự động chuyển câu hỏi sau 10 giây (server-side timer)
                    scheduleNextTurn(pin, 10);
                    return ResponseEntity.ok(room);
                }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CỐT LÕI CHỐNG DISCONNECT: SERVER-SIDE TIMER TỰ ĐỘNG CHUYỂN CÂU
    //
    // Đây là cơ chế then chốt xử lý tình huống mất mạng / tắt trình duyệt:
    //   1. Server lên lịch task sau `seconds` giây (mặc định 10s)
    //   2. Khi timer kích hoạt, server tự chuyển currentQuestionIndex lên 1
    //   3. Server reset frozenUserIds (ai bị freeze lượt trước sẽ bình thường lại)
    //   4. Server broadcast trạng thái mới → bất kỳ client nào còn kết nối sẽ nhận
    //   5. Nếu hết câu → đánh dấu FINISHED, dọn dẹp timer
    //
    // Kết quả: Dù 1 bên lag hay tắt trình duyệt, trận đấu vẫn tiến hành bình thường.
    // Client reconnect (load lại trang) sẽ nhận ngay trạng thái hiện tại qua WebSocket.
    // ─────────────────────────────────────────────────────────────────────────────
    private void scheduleNextTurn(String pin, int seconds) {
        // Hủy timer cũ nếu có (tránh chạy 2 timer song song)
        if (roomTimers.containsKey(pin)) {
            roomTimers.get(pin).cancel(false);
        }

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            gameRoomRepository.findByPin(pin).ifPresent(room -> {
                if (room.getCurrentQuestionIndex() < room.getTotalQuestions() - 1) {
                    // Còn câu hỏi → tăng index, reset timer, reset freeze, lưu DB, broadcast
                    room.setCurrentQuestionIndex(room.getCurrentQuestionIndex() + 1);
                    room.setTimerEndTime(System.currentTimeMillis() + 10000);
                    room.setFrozenUserIds(new ArrayList<>()); // Reset trạng thái đóng băng cho lượt mới
                    room.setLastActiveAt(new Date());
                    gameRoomRepository.save(room);
                    messagingTemplate.convertAndSend("/topic/room/" + pin, room);
                    scheduleNextTurn(pin, 10); // Tiếp tục lên lịch cho câu tiếp theo
                } else {
                    // Hết câu hỏi → kết thúc game
                    room.setStatus("FINISHED");
                    room.setLastActiveAt(new Date());
                    gameRoomRepository.save(room);
                    messagingTemplate.convertAndSend("/topic/room/" + pin, room);
                    roomTimers.remove(pin); // Giải phóng timer
                }
            });
        }, seconds, TimeUnit.SECONDS);

        roomTimers.put(pin, future);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // POWER-UP: ĐÓNG BĂNG ĐỐI THỦ (Freeze)
    // Server chọn ngẫu nhiên 1 đối thủ và thêm userId vào frozenUserIds.
    // Client nhận cập nhật → kiểm tra nếu userId mình nằm trong frozenUserIds
    // → disable toàn bộ nút trả lời cho lượt đó (xem game.js: showFrozenOverlay)
    // ─────────────────────────────────────────────────────────────────────────────
    @PostMapping("/{pin}/powerup/freeze")
    @Operation(summary = "Use freeze power-up to skip an opponent's turn")
    public ResponseEntity<GameRoom> useFreeze(@PathVariable String pin, @RequestParam String userId) {
        return gameRoomRepository.findByPin(pin).map(room -> {
            List<GameRoom.Player> opponents = room.getPlayers().stream()
                    .filter(p -> !p.getUserId().equals(userId))
                    .toList();

            if (!opponents.isEmpty()) {
                // Chọn ngẫu nhiên 1 đối thủ để đóng băng
                GameRoom.Player target = opponents.get(new Random().nextInt(opponents.size()));
                if (room.getFrozenUserIds() == null)
                    room.setFrozenUserIds(new ArrayList<>());
                room.getFrozenUserIds().add(target.getUserId());
                room.setLastActiveAt(new Date());
                gameRoomRepository.save(room);
                // Broadcast ngay để client của đối thủ nhận và hiển thị "bị đóng băng"
                messagingTemplate.convertAndSend("/topic/room/" + pin, room);
            }
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CẬP NHẬT ĐIỂM SỐ: SERVER LÀ NGUỒN SỰ THẬT DUY NHẤT
    // Client tính điểm cục bộ (tốc độ trả lời, streak...) rồi gửi lên server.
    // Server lưu vào DB và broadcast điểm đã cập nhật cho toàn phòng.
    // Leaderboard realtime được hiển thị dựa trên dữ liệu này.
    // ─────────────────────────────────────────────────────────────────────────────
    @PostMapping("/{pin}/score")
    @Operation(summary = "Update player score during game")
    public ResponseEntity<GameRoom> updateScore(@PathVariable String pin, @RequestParam String userId,
            @RequestParam int score) {
        return gameRoomRepository.findByPin(pin).map(room -> {
            if (room.getPlayers() != null) {
                room.getPlayers().stream()
                        .filter(p -> p.getUserId().equals(userId))
                        .findFirst()
                        .ifPresent(p -> p.setScore(score)); // Cập nhật điểm của đúng player
                room.setLastActiveAt(new Date());
                gameRoomRepository.save(room);
                // Broadcast điểm mới cho tất cả client (leaderboard realtime)
                messagingTemplate.convertAndSend("/topic/room/" + pin, room);
            }
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }
}
