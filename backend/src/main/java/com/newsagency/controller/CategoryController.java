package com.newsagency.controller;

import com.newsagency.dto.DTOs.*;
import com.newsagency.entity.Category;
import com.newsagency.repository.ArticleRepository;
import com.newsagency.repository.CategoryRepository;
import com.newsagency.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ArticleRepository articleRepository;
    @Autowired private ArticleService articleService;

    @GetMapping
    public List<CategoryDTO> list() {
        return categoryRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(
                    a.getDisplayOrder() == null ? 99 : a.getDisplayOrder(),
                    b.getDisplayOrder() == null ? 99 : b.getDisplayOrder()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/home")
    public List<CategoryWithArticles> homeData() {
        List<CategoryWithArticles> result = new ArrayList<>();

        List<Category> categories = categoryRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(
                    a.getDisplayOrder() == null ? 99 : a.getDisplayOrder(),
                    b.getDisplayOrder() == null ? 99 : b.getDisplayOrder()))
                .collect(Collectors.toList());

        for (Category cat : categories) {
            List<ArticleDTO> articles = articleRepository
                    .findByCategorySlugAndPublishedTrue(cat.getSlug())
                    .stream()
                    .sorted((a, b) -> {
                        if (a.getPublishedAt() == null) return 1;
                        if (b.getPublishedAt() == null) return -1;
                        return b.getPublishedAt().compareTo(a.getPublishedAt());
                    })
                    .limit(5)
                    .map(articleService::toDTO)
                    .collect(Collectors.toList());

            if (!articles.isEmpty()) {
                CategoryWithArticles cwa = new CategoryWithArticles();
                cwa.setCategory(toDTO(cat));
                cwa.setArticles(articles);
                result.add(cwa);
            }
        }
        return result;
    }

    private CategoryDTO toDTO(Category c) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setSlug(c.getSlug());
        dto.setParentSlug(c.getParentSlug());
        dto.setDisplayOrder(c.getDisplayOrder());
        dto.setArticleCount(
            articleRepository.findByCategorySlugAndPublishedTrue(c.getSlug()).size()
        );
        return dto;
    }
}
