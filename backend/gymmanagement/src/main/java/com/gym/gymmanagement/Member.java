package com.gym.gymmanagement;

import java.time.LocalDate;

import com.gym.gymmanagement.entity.MembershipPlan;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    /*
     * Email is optional.
     * If provided, frontend validates the email format.
     */
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "Phone number must contain exactly 10 digits"
    )
    private String phone;

    /*
     * Member's actual joining date.
     *
     * This date is used as the anchor date for
     * calculating the next membership fee date.
     */
    private LocalDate joinDate;

    /*
     * Membership plan determines the membership type
     * and duration.
     *
     * Examples:
     * Monthly  -> 1 month
     * 3 Months -> 3 months
     * 6 Months -> 6 months
     * Yearly   -> 12 months
     */
    @ManyToOne
    @JoinColumn(name = "membership_plan_id")
    private MembershipPlan membershipPlan;

    public Member() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDate joinDate) {
        this.joinDate = joinDate;
    }

    public MembershipPlan getMembershipPlan() {
        return membershipPlan;
    }

    public void setMembershipPlan(
            MembershipPlan membershipPlan) {

        this.membershipPlan = membershipPlan;
    }
}