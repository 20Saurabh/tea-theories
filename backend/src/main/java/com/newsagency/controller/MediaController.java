package com.newsagency.controller;

import com.newsagency.dto.DTOs.MediaDTO;
import com.newsagency.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/media")
@PreAuthorize("hasRole('ADMIN')")
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<MediaDTO> upload(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(mediaService.upload(file));
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping
    public List<MediaDTO> list(@RequestParam(required = false) String type) {
        if (type != null) return mediaService.getByType(type);
        return mediaService.getAll();
    }
}
