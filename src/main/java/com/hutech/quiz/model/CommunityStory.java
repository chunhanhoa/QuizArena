package com.hutech.quiz.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "community_stories")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class CommunityStory {

    @Id
    private String id;
    private String title;
    private String description;
    private String genre; // Mystery, Survival, Sci-Fi, Romance, Horror, Adventure...
    private String thumbnail;
    private String authorId;
    private String authorName;
    private Date createdAt;
    private Date updatedAt;
    private String status; // DRAFT, PUBLISHED, REJECTED
    private Integer likes;
    private Integer plays;
    private List<StoryNode> nodes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class StoryNode {
        private String id;
        private String charName;
        private String dialogue;
        private String backgroundImage;
        @com.fasterxml.jackson.annotation.JsonProperty("isEnding")
        private Boolean ending;     // Boolean wrapper → Lombok getter: getEnding(), không xung đột với Jackson
        private String endingType;
        private List<Choice> choices;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Choice {
        private String text;
        private String nextNodeId; // null if leads to ending
    }
}
