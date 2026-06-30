package com.resumeparser.controller;

import com.resumeparser.dto.AuthRequest;
import com.resumeparser.dto.AuthResponse;
import com.resumeparser.dto.RegisterRequest;
import com.resumeparser.dto.UserDto;
import com.resumeparser.entity.User;
import com.resumeparser.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = authService.registerUser(registerRequest);
        return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully: " + user.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = authService.authenticateUser(authRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDto profile = authService.getProfile(auth.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateUserProfile(@RequestBody UserDto userDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDto updated = authService.updateProfile(auth.getName(), userDto);
        return ResponseEntity.ok(updated);
    }
}
