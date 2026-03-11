package com.newsagency.controller;

import com.newsagency.dto.DTOs.*;
import com.newsagency.entity.*;
import com.newsagency.repository.*;
import com.newsagency.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ArticleController {

    @Autowired private ArticleService articleService;
    @Autowired private CommentRepository commentRepository;
    @Autowired private ArticleLikeRepository likeRepository;
    @Autowired private ArticleRepository articleRepository;

    @GetMapping("/articles")
    public List<ArticleDTO> listPublished() {
        return articleService.getAllPublished();
    }

    @GetMapping("/articles/{slug}")
    public ResponseEntity<ArticleDTO> getBySlug(@PathVariable String slug) {
        try {
            ArticleDTO dto = articleService.getBySlug(slug);
            if (!Boolean.TRUE.equals(dto.getPublished())) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Related articles from same category
    @GetMapping("/articles/{slug}/related")
    public List<ArticleDTO> getRelated(@PathVariable String slug) {
        try {
            ArticleDTO article = articleService.getBySlug(slug);
            if (article.getCategorySlug() == null) return List.of();
            return articleService.getRelated(article.getCategorySlug(), slug, 3);
        } catch (RuntimeException e) {
            return List.of();
        }
    }

    @GetMapping("/categories/{slug}/articles")
    public List<ArticleDTO> getByCategory(@PathVariable String slug) {
        return articleService.getByCategory(slug);
    }

    // Get articles for a parent category including all subcategories
    @GetMapping("/categories/{slug}/articles-with-children")
    public List<ArticleDTO> getByParentCategory(@PathVariable String slug) {
        return articleService.getByParentCategory(slug);
    }

    // Comments
    @GetMapping("/articles/{slug}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable String slug) {
        return articleRepository.findBySlug(slug)
            .map(article -> {
                List<CommentDTO> dtos = commentRepository
                    .findByArticleIdAndApprovedTrueOrderByCreatedAtAsc(article.getId())
                    .stream().map(c -> {
                        CommentDTO dto = new CommentDTO();
                        dto.setId(c.getId());
                        dto.setAuthorName(c.getAuthorName());
                        dto.setContent(c.getContent());
                        dto.setCreatedAt(c.getCreatedAt());
                        return dto;
                    }).collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/articles/{slug}/comments")
    public ResponseEntity<?> addComment(@PathVariable String slug, @RequestBody CommentRequest req) {
        if (req.getContent() == null || req.getContent().isBlank())
            return ResponseEntity.badRequest().body("Content cannot be empty");
        return articleRepository.findBySlug(slug)
            .map(article -> {
                Comment comment = new Comment();
                comment.setArticle(article);
                comment.setAuthorName(
                    (req.getAuthorName() != null && !req.getAuthorName().isBlank())
                        ? req.getAuthorName().trim() : "Anonymous");
                comment.setAuthorEmail(req.getAuthorEmail());
                comment.setContent(req.getContent().trim());
                comment.setApproved(true);
                Comment saved = commentRepository.save(comment);
                CommentDTO dto = new CommentDTO();
                dto.setId(saved.getId());
                dto.setAuthorName(saved.getAuthorName());
                dto.setContent(saved.getContent());
                dto.setCreatedAt(saved.getCreatedAt());
                return ResponseEntity.ok(dto);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Likes
    @GetMapping("/articles/{slug}/like")
    public ResponseEntity<LikeResponse> getLikes(@PathVariable String slug,
            @RequestParam(required = false) String token) {
        return articleRepository.findBySlug(slug)
            .map(article -> {
                LikeResponse res = new LikeResponse();
                res.setCount(likeRepository.countByArticleId(article.getId()));
                res.setLiked(token != null && !token.isBlank() &&
                    likeRepository.existsByArticleIdAndVisitorToken(article.getId(), token));
                return ResponseEntity.ok(res);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/articles/{slug}/like")
    public ResponseEntity<LikeResponse> toggleLike(@PathVariable String slug, @RequestParam String token) {
        if (token == null || token.isBlank()) return ResponseEntity.badRequest().build();
        return articleRepository.findBySlug(slug)
            .map(article -> {
                var existing = likeRepository.findByArticleIdAndVisitorToken(article.getId(), token);
                if (existing.isPresent()) {
                    likeRepository.delete(existing.get());
                } else {
                    ArticleLike like = new ArticleLike();
                    like.setArticle(article);
                    like.setVisitorToken(token);
                    likeRepository.save(like);
                }
                LikeResponse res = new LikeResponse();
                res.setCount(likeRepository.countByArticleId(article.getId()));
                res.setLiked(existing.isEmpty());
                return ResponseEntity.ok(res);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Admin
    @GetMapping("/admin/articles")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ArticleDTO> adminListAll() { return articleService.getAllForAdmin(); }

    @GetMapping("/admin/articles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArticleDTO> adminGetById(@PathVariable Long id) {
        try { return ResponseEntity.ok(articleService.getById(id)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping("/admin/articles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArticleDTO> adminCreate(@RequestBody ArticleRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(articleService.create(req));
    }

    @PutMapping("/admin/articles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArticleDTO> adminUpdate(@PathVariable Long id, @RequestBody ArticleRequest req) {
        try { return ResponseEntity.ok(articleService.update(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/admin/articles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDelete(@PathVariable Long id) {
        try { articleService.delete(id); return ResponseEntity.noContent().build(); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }
}
