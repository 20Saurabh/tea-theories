package com.newsagency.repository;

import com.newsagency.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByArticleIdAndApprovedTrueOrderByCreatedAtAsc(Long articleId);
    List<Comment> findByArticleIdOrderByCreatedAtAsc(Long articleId);
    long countByArticleIdAndApprovedTrue(Long articleId);
}
