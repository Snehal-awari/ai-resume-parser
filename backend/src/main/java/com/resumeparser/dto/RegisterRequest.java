package com.resumeparser.dto;

import com.resumeparser.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotNull(message = "Role is required")
    private Role role;
}
