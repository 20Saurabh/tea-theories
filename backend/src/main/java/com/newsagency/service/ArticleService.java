package com.newsagency.service;

import com.newsagency.dto.DTOs.*;
import com.newsagency.entity.*;
import com.newsagency.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    @Autowired private ArticleRepository articleRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private ArticleLikeRepository likeRepository;

    public List<ArticleDTO> getAllPublished() {
        return articleRepository.findByPublishedTrueOrderByPublishedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ArticleDTO> getAllForAdmin() {
        return articleRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .map(this::toDTO).collect(Collectors.toList());
    }

    public ArticleDTO getBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found: " + slug));
        return toDTO(article);
    }

    public ArticleDTO getById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
        return toDTO(article);
    }

    public List<ArticleDTO> getByCategory(String categorySlug) {
        return articleRepository.findByCategorySlugAndPublishedTrue(categorySlug)
                .stream()
                .sorted((a, b) -> {
                    if (a.getPublishedAt() == null) return 1;
                    if (b.getPublishedAt() == null) return -1;
                    return b.getPublishedAt().compareTo(a.getPublishedAt());
                })
                .map(this::toDTO).collect(Collectors.toList());
    }

    // Get articles for a parent category including all subcategories
    public List<ArticleDTO> getByParentCategory(String parentSlug) {
        return articleRepository.findByParentCategorySlug(parentSlug)
                .stream()
                .sorted((a, b) -> {
                    if (a.getPublishedAt() == null) return 1;
                    if (b.getPublishedAt() == null) return -1;
                    return b.getPublishedAt().compareTo(a.getPublishedAt());
                })
                .map(this::toDTO).collect(Collectors.toList());
    }

    // Related articles: same category, exclude current
    public List<ArticleDTO> getRelated(String categorySlug, String excludeSlug, int limit) {
        return articleRepository.findByCategorySlugAndPublishedTrue(categorySlug)
                .stream()
                .filter(a -> !a.getSlug().equals(excludeSlug))
                .sorted((a, b) -> {
                    if (a.getPublishedAt() == null) return 1;
                    if (b.getPublishedAt() == null) return -1;
                    return b.getPublishedAt().compareTo(a.getPublishedAt());
                })
                .limit(limit)
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ArticleDTO create(ArticleRequest req) {
        Article article = new Article();
        article.setSlug(buildSlug(req.getTitle()));
        applyRequest(article, req);
        if (Boolean.TRUE.equals(req.getPublished())) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return toDTO(articleRepository.save(article));
    }

    @Transactional
    public ArticleDTO update(Long id, ArticleRequest req) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
        boolean wasUnpublished = !Boolean.TRUE.equals(article.getPublished());
        applyRequest(article, req);
        if (wasUnpublished && Boolean.TRUE.equals(req.getPublished()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return toDTO(articleRepository.save(article));
    }

    @Transactional
    public void delete(Long id) {
        articleRepository.deleteById(id);
    }

    // Auto-publish scheduled articles (called periodically or on request)
    @Transactional
    public void publishScheduled() {
        LocalDateTime now = LocalDateTime.now();
        articleRepository.findAll().stream()
            .filter(a -> !Boolean.TRUE.equals(a.getPublished())
                    && a.getScheduledAt() != null
                    && a.getScheduledAt().isBefore(now))
            .forEach(a -> {
                a.setPublished(true);
                a.setPublishedAt(a.getScheduledAt());
                articleRepository.save(a);
            });
    }

    private void applyRequest(Article article, ArticleRequest req) {
        if (req.getTitle() != null) article.setTitle(req.getTitle());
        if (req.getSlug() != null && !req.getSlug().isBlank()) {
            article.setSlug(req.getSlug().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-").trim());
        }
        if (req.getExcerpt() != null) article.setExcerpt(req.getExcerpt());
        if (req.getContent() != null) article.setContent(req.getContent());
        if (req.getCoverImage() != null) article.setCoverImage(req.getCoverImage());
        if (req.getAuthor() != null && !req.getAuthor().isBlank()) article.setAuthor(req.getAuthor());
        if (req.getPublished() != null) article.setPublished(req.getPublished());
        if (req.getMetaDescription() != null) article.setMetaDescription(req.getMetaDescription());
        if (req.getTags() != null) article.setTags(req.getTags());
        if (req.getScheduledAt() != null) article.setScheduledAt(req.getScheduledAt());
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(article::setCategory);
        }
    }

    private String buildSlug(String title) {
        if (title == null || title.isBlank()) return "article-" + System.currentTimeMillis();
        String base = title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-").trim();
        if (base.isEmpty()) base = "article";
        return base + "-" + System.currentTimeMillis();
    }

    // Calculate reading time: ~200 words per minute
    private int calculateReadingTime(String content) {
        if (content == null || content.isBlank()) return 1;
        String text = content.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
        int words = text.split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 200.0));
    }

    public ArticleDTO toDTO(Article a) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setSlug(a.getSlug());
        dto.setExcerpt(a.getExcerpt());
        dto.setContent(a.getContent());
        dto.setCoverImage(a.getCoverImage());
        dto.setAuthor(a.getAuthor());
        dto.setPublished(a.getPublished());
        dto.setMetaDescription(a.getMetaDescription());
        dto.setTags(a.getTags());
        dto.setScheduledAt(a.getScheduledAt());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setPublishedAt(a.getPublishedAt());
        dto.setReadingTime(calculateReadingTime(a.getContent()));
        if (a.getCategory() != null) {
            dto.setCategoryName(a.getCategory().getName());
            dto.setCategorySlug(a.getCategory().getSlug());
        }
        dto.setLikeCount(likeRepository.countByArticleId(a.getId()));
        dto.setCommentCount(commentRepository.countByArticleIdAndApprovedTrue(a.getId()));
        return dto;
    }
}
