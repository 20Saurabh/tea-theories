package com.newsagency.service;

import com.newsagency.dto.DTOs.MediaDTO;
import com.newsagency.entity.MediaFile;
import com.newsagency.repository.MediaFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MediaService {

    @Autowired
    private MediaFileRepository mediaFileRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public MediaDTO upload(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IOException("Uploaded file is empty");

        String mimeType = file.getContentType();
        String fileType = detectFileType(mimeType);

        String originalName = file.getOriginalFilename();
        if (originalName == null) originalName = "upload";

        // Sanitise original name
        originalName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

        String ext = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) ext = originalName.substring(dotIdx);

        String storedName = UUID.randomUUID().toString() + ext;

        Path subDir = Paths.get(uploadDir, fileType.toLowerCase()).toAbsolutePath();
        Files.createDirectories(subDir);

        Path dest = subDir.resolve(storedName);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        MediaFile media = new MediaFile();
        media.setOriginalName(originalName);
        media.setStoredName(storedName);
        media.setFilePath(dest.toString());
        media.setFileType(fileType);
        media.setMimeType(mimeType != null ? mimeType : "application/octet-stream");
        media.setFileSize(file.getSize());
        media.setUrl("/uploads/" + fileType.toLowerCase() + "/" + storedName);

        return toDTO(mediaFileRepository.save(media));
    }

    public List<MediaDTO> getAll() {
        return mediaFileRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<MediaDTO> getByType(String type) {
        return mediaFileRepository.findByFileTypeOrderByCreatedAtDesc(type.toUpperCase())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private String detectFileType(String mimeType) {
        if (mimeType == null) return "IMAGE";
        if (mimeType.startsWith("image/")) return "IMAGE";
        if (mimeType.startsWith("video/")) return "VIDEO";
        if (mimeType.startsWith("audio/")) return "AUDIO";
        return "IMAGE";
    }

    public MediaDTO toDTO(MediaFile m) {
        MediaDTO dto = new MediaDTO();
        dto.setId(m.getId());
        dto.setOriginalName(m.getOriginalName());
        dto.setFileType(m.getFileType());
        dto.setMimeType(m.getMimeType());
        dto.setFileSize(m.getFileSize());
        dto.setUrl(m.getUrl());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
