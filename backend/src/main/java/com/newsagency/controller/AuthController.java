package com.newsagency.controller;

import com.newsagency.dto.DTOs.*;
import com.newsagency.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        if (adminUsername.equals(req.getUsername()) && adminPassword.equals(req.getPassword())) {
            String token = jwtUtil.generateToken(req.getUsername());
            AuthResponse res = new AuthResponse();
            res.setToken(token);
            res.setUsername(req.getUsername());
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
