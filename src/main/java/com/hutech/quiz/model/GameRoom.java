package com.hutech.quiz.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// MODEL: PHÒNG GAME (lưu trong MongoDB collection "game_rooms")
//
// Đây là nguồn sự thật duy nhất (single source of truth) cho trạng thái trận đấu.
// Mọi client đều đồng bộ theo dữ liệu của document này qua WebSocket broadcast.
// ─────────────────────────────────────────────────────────────────────────────
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "game_rooms")
public class GameRoom {
    @Id
    private String id;

    private String pin;       // Mã PIN 6 chữ số để join phòng
    private String hostId;    // UserId của người tạo phòng
    private String quizId;    // ID bộ câu hỏi được chọn

    private List<Player> players; // Danh sách người chơi + điểm số (leaderboard)

    // Trạng thái vòng đời phòng: WAITING → STARTED → FINISHED
    private String status;

    // Index câu hỏi hiện tại (được server tăng dần qua scheduleNextTurn)
    private int currentQuestionIndex;

    // Thời điểm câu hỏi kết thúc (epoch ms), client dùng để tính đồng hồ đếm ngược
    private long timerEndTime;

    private int totalQuestions; // Tổng số câu hỏi trong bộ quiz

    // ANTI-CHEAT / POWER-UP: Danh sách userId bị đóng băng lượt này
    // Server reset về rỗng mỗi khi chuyển sang câu mới
    private List<String> frozenUserIds;

    // CHỐNG DISCONNECT: Timestamp hoạt động cuối cùng
    // GameRoomCleanupService dùng trường này để xóa phòng không còn hoạt động sau 15 phút
    private java.util.Date lastActiveAt;

    // ─────────────────────────────────────────────────────────────────────────
    // Thông tin người chơi trong phòng
    // ─────────────────────────────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Player {
        private String userId;   // Dùng để định danh + check trùng khi join
        private String username; // Tên hiển thị trên leaderboard
        private int score;       // Điểm tích lũy, server cập nhật qua /score API
        private boolean ready;   // Trạng thái sẵn sàng trong lobby
    }
}
