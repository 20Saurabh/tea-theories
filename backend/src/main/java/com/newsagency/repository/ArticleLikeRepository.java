package com.newsagency.repository;

import com.newsagency.entity.ArticleLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ArticleLikeRepository extends JpaRepository<ArticleLike, Long> {
    long countByArticleId(Long articleId);
    Optional<ArticleLike> findByArticleIdAndVisitorToken(Long articleId, String visitorToken);
    boolean existsByArticleIdAndVisitorToken(Long articleId, String visitorToken);
}
