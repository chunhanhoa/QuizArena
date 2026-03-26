package com.hutech.quiz.controller;

import com.hutech.quiz.model.User;
import com.hutech.quiz.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for user profile management")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public String profilePage() {
        return "profile";
    }

    @GetMapping("/api/users/{userId}")
    @ResponseBody
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUser(@PathVariable String userId) {
        return userRepository.findById(userId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/users/{userId}/profile")
    @ResponseBody
    @Operation(summary = "Update user profile")
    public ResponseEntity<?> updateProfile(@PathVariable String userId, @RequestBody Map<String, String> updates) {
        return userRepository.findById(userId).map(user -> {
            if (user.getProfile() == null) {
                user.setProfile(new User.Profile());
            }
            if (updates.containsKey("displayName")) {
                user.getProfile().setDisplayName(updates.get("displayName"));
            }
            if (updates.containsKey("avatar")) {
                user.getProfile().setAvatar(updates.get("avatar"));
            }
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }
}
