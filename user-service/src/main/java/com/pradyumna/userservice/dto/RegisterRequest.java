package com.pradyumna.userservice.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String passwordHash;
    private String fullName;
    private String phone;
    private String role;
}
