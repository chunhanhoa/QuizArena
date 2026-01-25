package com.hutech.quiz.controller;

import com.hutech.quiz.model.Quiz;
import com.hutech.quiz.model.Quiz.Question;
import com.hutech.quiz.repository.QuizRepository;
import com.hutech.quiz.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quiz Management", description = "APIs for creating, managing, and generating quizzes")
public class QuizController {

    private final QuizRepository quizRepository;
    private final AIService aiService;

    @PostMapping("/generate")
    @Operation(summary = "Generate quiz questions using AI", description = "Creates a list of questions based on a topic using Groq AI")
    public ResponseEntity<List<Question>> generateQuestions(@RequestParam String topic,
            @RequestParam(defaultValue = "5") int count) {
        List<Question> questions = aiService.generateQuestions(topic, count);
        return ResponseEntity.ok(questions);
    }

    @PostMapping
    @Operation(summary = "Create a new quiz (Admin)", description = "Saves a manually created quiz object to MongoDB")
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    @GetMapping
    @Operation(summary = "Get quizzes with optional category filter")
    public ResponseEntity<List<Quiz>> getQuizzes(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(quizRepository.findByCategory(category));
        }
        return ResponseEntity.ok(quizRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quiz by ID")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        return quizRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
