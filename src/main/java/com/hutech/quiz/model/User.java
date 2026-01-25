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
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private Profile profile;
    private Social social;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Profile {
        private String avatar;
        private int level = 1;
        private int xp = 0;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Social {
        private List<String> following;
        private List<String> followers;
    }
}
