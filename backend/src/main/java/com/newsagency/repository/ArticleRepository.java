package com.newsagency.repository;

import com.newsagency.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);
    Page<Article> findByPublishedTrue(Pageable pageable);
    List<Article> findByCategorySlugAndPublishedTrue(String categorySlug);
    List<Article> findByPublishedTrueOrderByPublishedAtDesc();

    // Find articles where category is either the parent slug or a subcategory of the parent
    @Query("SELECT a FROM Article a JOIN a.category c WHERE a.published = true AND " +
           "(c.slug = :categorySlug OR c.parentSlug = :categorySlug) " +
           "ORDER BY a.publishedAt DESC")
    List<Article> findByParentCategorySlug(String categorySlug);

    @Query("SELECT a FROM Article a WHERE a.published = true AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.excerpt) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Article> searchPublished(String q);
}
