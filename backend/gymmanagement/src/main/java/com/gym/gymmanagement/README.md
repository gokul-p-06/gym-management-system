# Gym Management System - Backend

This is the backend REST API for the Gym Management System.

The backend is responsible for authentication, authorization, database operations, and API services used by the React frontend.

## Technologies Used

- Java 21
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT Authentication
- BCrypt Password Encryption
- Maven
- MySQL

## Main Modules

The backend provides APIs for:

- User Authentication
- Members
- Membership Plans
- Attendance
- Workouts
- Payments
- Equipment
- Trainers

## Authentication

The application uses JWT-based authentication.

### Login

```text
POST /users/login