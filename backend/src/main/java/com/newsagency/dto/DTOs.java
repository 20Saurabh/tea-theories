package com.newsagency.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class DTOs {

    @Data
    public static class ArticleDTO {
        private Long id;
        private String title;
        private String slug;
        private String excerpt;
        private String content;
        private String coverImage;
        private String categoryName;
        private String categorySlug;
        private String author;
        private Boolean published;
        private String metaDescription;
        private String tags;
        private LocalDateTime scheduledAt;
        private LocalDateTime createdAt;
        private LocalDateTime publishedAt;
        private long likeCount;
        private long commentCount;
        private int readingTime; // minutes
    }

    @Data
    public static class ArticleRequest {
        private String title;
        private String slug;
        private String excerpt;
        private String content;
        private String coverImage;
        private Long categoryId;
        private String author;
        private Boolean published;
        private String metaDescription;
        private String tags;
        private LocalDateTime scheduledAt;
    }

    @Data
    public static class CategoryDTO {
        private Long id;
        private String name;
        private String slug;
        private String parentSlug;
        private Integer displayOrder;
        private long articleCount;
    }

    @Data
    public static class CommentDTO {
        private Long id;
        private String authorName;
        private String content;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CommentRequest {
        private String authorName;
        private String authorEmail;
        private String content;
    }

    @Data
    public static class LikeResponse {
        private long count;
        private boolean liked;
    }

    @Data
    public static class AuthRequest {
        private String username;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
    }

    @Data
    public static class MediaDTO {
        private Long id;
        private String originalName;
        private String fileType;
        private String mimeType;
        private Long fileSize;
        private String url;
        private LocalDateTime createdAt;
    }

    @Data
    public static class HomePageDTO {
        private List<CategoryWithArticles> categories;
    }

    @Data
    public static class CategoryWithArticles {
        private CategoryDTO category;
        private List<ArticleDTO> articles;
    }
}
