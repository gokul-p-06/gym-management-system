package com.gym.gymmanagement.service;

import com.gym.gymmanagement.entity.RefreshToken;
import com.gym.gymmanagement.entity.User;
import com.gym.gymmanagement.repository.RefreshTokenRepository;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 30; // 30 days

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository) {

        this.refreshTokenRepository =
                refreshTokenRepository;
    }

    public RefreshToken createRefreshToken(User user) {

        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setToken(
                UUID.randomUUID().toString()
        );

        refreshToken.setExpiryDate(
                Instant.now().plusMillis(
                        REFRESH_TOKEN_EXPIRATION
                )
        );

        refreshToken.setUser(user);

        return refreshTokenRepository.save(
                refreshToken
        );
    }

    public RefreshToken findByToken(String token) {

        return refreshTokenRepository
                .findByToken(token)
                .orElse(null);
    }

    public boolean isRefreshTokenValid(
            RefreshToken refreshToken) {

        return refreshToken != null
                && refreshToken.getExpiryDate()
                        .isAfter(Instant.now());
    }

    public void deleteByToken(String token) {

        refreshTokenRepository
                .deleteByToken(token);
    }
}