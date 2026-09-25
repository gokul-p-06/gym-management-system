package com.gym.gymmanagement.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    // Access token = 15 minutes
    private static final long ACCESS_TOKEN_EXPIRATION =
            1000 * 60 * 15;

    // Refresh token = 30 days
    private static final long REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 30;

    private SecretKey getKey() {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =========================
    // ACCESS TOKEN
    // =========================

    public String generateToken(
            String username,
            String role) {

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + ACCESS_TOKEN_EXPIRATION
                        )
                )
                .signWith(getKey())
                .compact();
    }

    // =========================
    // REFRESH TOKEN
    // =========================

    public String generateRefreshToken(
            String username) {

        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + REFRESH_TOKEN_EXPIRATION
                        )
                )
                .signWith(getKey())
                .compact();
    }

    // =========================
    // EXTRACT USERNAME
    // =========================

    public String extractUsername(String token) {

        return extractAllClaims(token)
                .getSubject();
    }

    // =========================
    // EXTRACT ROLE
    // =========================

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }

    // =========================
    // VALIDATE TOKEN
    // =========================

    public boolean isTokenValid(String token) {

        try {

            extractAllClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    // =========================
    // VALIDATE REFRESH TOKEN
    // =========================

    public boolean isRefreshTokenValid(
            String token) {

        try {

            Claims claims =
                    extractAllClaims(token);

            String type =
                    claims.get(
                            "type",
                            String.class
                    );

            return "refresh".equals(type);

        } catch (Exception e) {

            return false;
        }
    }

    // =========================
    // CLAIMS
    // =========================

    private Claims extractAllClaims(
            String token) {

        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}