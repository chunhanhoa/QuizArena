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
@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;
    private String creatorId;
    private String creatorName;
    private String title;
    private String description;
    private String category;
    private String thumbnail;
    private List<Question> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private String content;
        private String imageUrl; // Thêm ảnh cho từng câu hỏi
        private String type; // multiple-choice, true-false
        private List<Option> options;
        private int timeLimit; // in seconds
        private String explanation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Option {
        private String text;
        @com.fasterxml.jackson.annotation.JsonProperty("isCorrect")
        private boolean correct;
    }
}
