package com.resumeparser.dto;

import com.resumeparser.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String username;
    private String email;
    private Role role;
    private String password;
}
