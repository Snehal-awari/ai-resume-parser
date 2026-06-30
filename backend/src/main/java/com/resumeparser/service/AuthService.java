package com.resumeparser.service;

import com.resumeparser.dto.AuthRequest;
import com.resumeparser.dto.AuthResponse;
import com.resumeparser.dto.RegisterRequest;
import com.resumeparser.dto.UserDto;
import com.resumeparser.entity.Role;
import com.resumeparser.entity.User;
import com.resumeparser.exception.BadRequestException;
import com.resumeparser.repository.UserRepository;
import com.resumeparser.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        logger.info("Successfully registered user: {}", savedUser.getUsername());
        return savedUser;
    }

    public AuthResponse authenticateUser(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User record not found post-auth."));

        logger.info("Successfully authenticated user: {}", user.getUsername());
        com.resumeparser.service.AdminStore.logActivity(user.getUsername(), "LOGIN", "Successfully logged into the system");
        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public UserDto updateProfile(String currentUsername, UserDto dto) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new BadRequestException("User profile not found."));

        if (!user.getEmail().equalsIgnoreCase(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already taken by another user.");
        }

        user.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            logger.info("Password updated for user: {}", currentUsername);
        }

        User updatedUser = userRepository.save(user);
        return UserDto.builder()
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User profile not found."));
        return UserDto.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
