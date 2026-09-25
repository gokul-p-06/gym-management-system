package com.gym.gymmanagement.controller;

import com.gym.gymmanagement.entity.User;
import com.gym.gymmanagement.repository.UserRepository;
import com.gym.gymmanagement.service.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserController(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // =========================
    // CREATE USER
    // =========================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@RequestBody User user) {

        String hashedPassword =
                passwordEncoder.encode(
                        user.getPassword()
                );

        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User user) {

        Optional<User> existingUser =
                userRepository.findByUsername(
                        user.getUsername()
                );

        if (existingUser.isPresent()
                && passwordEncoder.matches(
                        user.getPassword(),
                        existingUser.get().getPassword()
                )) {

            User loggedInUser =
                    existingUser.get();

            String accessToken =
                    jwtService.generateToken(
                            loggedInUser.getUsername(),
                            loggedInUser.getRole()
                    );

            String refreshToken =
                    jwtService.generateRefreshToken(
                            loggedInUser.getUsername()
                    );

            Map<String, String> response =
                    new HashMap<>();

            response.put(
                    "accessToken",
                    accessToken
            );

            response.put(
                    "refreshToken",
                    refreshToken
            );

            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(401)
                .body(
                        "Invalid username or password"
                );
    }

    // =========================
    // REFRESH TOKEN
    // =========================

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @RequestBody Map<String, String> request) {

        String refreshToken =
                request.get("refreshToken");

        if (refreshToken == null
                || refreshToken.isBlank()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Refresh token is required"
                    );
        }

        if (!jwtService.isRefreshTokenValid(
                refreshToken)) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "Invalid or expired refresh token"
                    );
        }

        String username =
                jwtService.extractUsername(
                        refreshToken
                );

        Optional<User> existingUser =
                userRepository.findByUsername(
                        username
                );

        if (existingUser.isEmpty()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            "User not found"
                    );
        }

        User user =
                existingUser.get();

        String newAccessToken =
                jwtService.generateToken(
                        user.getUsername(),
                        user.getRole()
                );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "accessToken",
                newAccessToken
        );

        return ResponseEntity.ok(response);
    }
}