package com.hutech.quiz.controller;

import com.hutech.quiz.model.User;
import com.hutech.quiz.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user registration and login")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại!");
        }

        // Initialize profile and social if null
        if (user.getProfile() == null) {
            user.setProfile(new User.Profile());
            user.getProfile().setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getUsername());
        }
        if (user.getSocial() == null) {
            user.setSocial(new User.Social(new ArrayList<>(), new ArrayList<>()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.ok(userOpt.get());
        }

        return ResponseEntity.status(401).body("Sai thông tin đăng nhập!");
    }
}
