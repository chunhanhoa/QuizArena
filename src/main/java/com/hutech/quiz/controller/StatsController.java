package com.hutech.quiz.controller;

import com.hutech.quiz.repository.GameRoomRepository;
import com.hutech.quiz.repository.QuizRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final QuizRepository quizRepository;
    private final GameRoomRepository gameRoomRepository;

    @GetMapping
    @Operation(summary = "Get system statistics for Admin")
    public ResponseEntity<Map<String, Long>> getStats() {
        long totalQuizzes = quizRepository.count();
        long activeRooms = gameRoomRepository.count();
        return ResponseEntity.ok(Map.of(
                "totalQuizzes", totalQuizzes,
                "activeRooms", activeRooms));
    }
}
