package com.hutech.quiz.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "game_rooms")
public class GameRoom {
    @Id
    private String id;
    private String pin;
    private String hostId;
    private String quizId;
    private List<Player> players;
    private String status; // WAITING, STARTED, FINISHED
    private int currentQuestionIndex;
    private long timerEndTime;
    private int totalQuestions;
    private List<String> frozenUserIds; // User IDs who are skipped for the current turn

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Player {
        private String userId;
        private String username;
        private int score;
        private boolean ready;
    }
}
