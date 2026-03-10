package com.newsagency.repository;

import com.newsagency.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findByFileTypeOrderByCreatedAtDesc(String fileType);
    List<MediaFile> findAllByOrderByCreatedAtDesc();
}
