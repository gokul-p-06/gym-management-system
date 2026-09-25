package com.gym.gymmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.gym.gymmanagement.entity.Workout;

public interface WorkoutRepository
        extends JpaRepository<Workout, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Workout w WHERE w.member.id = :memberId")
    void deleteByMemberId(
            @Param("memberId") Long memberId
    );
}