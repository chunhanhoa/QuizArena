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
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, ScheduledFuture<?>> roomTimers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

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

    @PostMapping("/{pin}/join")
    @Operation(summary = "Join a room")
    public ResponseEntity<GameRoom> joinRoom(@PathVariable String pin, @RequestParam String userId,
            @RequestParam String username) {
        return gameRoomRepository.findByPin(pin).map(room -> {
            if (room.getPlayers() == null) {
                room.setPlayers(new ArrayList<>());
            }
            boolean exists = room.getPlayers().stream().anyMatch(p -> p.getUserId().equals(userId));
            if (!exists) {
                GameRoom.Player player = new GameRoom.Player(userId, username, 0, true);
                room.getPlayers().add(player);
                gameRoomRepository.save(room);
            }
            messagingTemplate.convertAndSend("/topic/room/" + pin, room);
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }

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
                    room.setFrozenUserIds(new ArrayList<>());
                    room.setTimerEndTime(System.currentTimeMillis() + 10000);
                    gameRoomRepository.save(room);

                    messagingTemplate.convertAndSend("/topic/room/" + pin, room);
                    scheduleNextTurn(pin, 10);
                    return ResponseEntity.ok(room);
                }).orElse(ResponseEntity.notFound().build());
    }

    private void scheduleNextTurn(String pin, int seconds) {
        if (roomTimers.containsKey(pin)) {
            roomTimers.get(pin).cancel(false);
        }

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            gameRoomRepository.findByPin(pin).ifPresent(room -> {
                if (room.getCurrentQuestionIndex() < room.getTotalQuestions() - 1) {
                    room.setCurrentQuestionIndex(room.getCurrentQuestionIndex() + 1);
                    room.setTimerEndTime(System.currentTimeMillis() + 10000);
                    room.setFrozenUserIds(new ArrayList<>()); // Reset frozen status for next turn
                    gameRoomRepository.save(room);
                    messagingTemplate.convertAndSend("/topic/room/" + pin, room);
                    scheduleNextTurn(pin, 10);
                } else {
                    room.setStatus("FINISHED");
                    gameRoomRepository.save(room);
                    messagingTemplate.convertAndSend("/topic/room/" + pin, room);
                    roomTimers.remove(pin);
                }
            });
        }, seconds, TimeUnit.SECONDS);

        roomTimers.put(pin, future);
    }

    @PostMapping("/{pin}/powerup/freeze")
    @Operation(summary = "Use freeze power-up to skip an opponent's turn")
    public ResponseEntity<GameRoom> useFreeze(@PathVariable String pin, @RequestParam String userId) {
        return gameRoomRepository.findByPin(pin).map(room -> {
            List<GameRoom.Player> opponents = room.getPlayers().stream()
                    .filter(p -> !p.getUserId().equals(userId))
                    .toList();

            if (!opponents.isEmpty()) {
                GameRoom.Player target = opponents.get(new Random().nextInt(opponents.size()));
                if (room.getFrozenUserIds() == null)
                    room.setFrozenUserIds(new ArrayList<>());
                room.getFrozenUserIds().add(target.getUserId());
                gameRoomRepository.save(room);
                messagingTemplate.convertAndSend("/topic/room/" + pin, room);
            }
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{pin}/score")
    @Operation(summary = "Update player score during game")
    public ResponseEntity<GameRoom> updateScore(@PathVariable String pin, @RequestParam String userId,
            @RequestParam int score) {
        return gameRoomRepository.findByPin(pin).map(room -> {
            if (room.getPlayers() != null) {
                room.getPlayers().stream()
                        .filter(p -> p.getUserId().equals(userId))
                        .findFirst()
                        .ifPresent(p -> p.setScore(score));
                gameRoomRepository.save(room);
                messagingTemplate.convertAndSend("/topic/room/" + pin, room);
            }
            return ResponseEntity.ok(room);
        }).orElse(ResponseEntity.notFound().build());
    }
}
