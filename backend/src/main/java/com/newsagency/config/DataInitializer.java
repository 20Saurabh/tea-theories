package com.newsagency.config;

import com.newsagency.entity.Category;
import com.newsagency.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            // Parent categories (flat structure for Explore Themes)
            createCategory("News", "news", null, 1);
            createCategory("Philosophy", "philosophy", null, 2);
            createCategory("Ethics", "ethics", null, 3);
            createCategory("Literature", "literature", null, 4);
            createCategory("Others", "others", null, 5);
            
            // News subcategories (for dropdown filter)
            createCategory("National", "national", "news", 1);
            createCategory("International", "international", "news", 2);
            
            // Literature subcategories (for dropdown filter)
            createCategory("Hindi", "hindi", "literature", 1);
            createCategory("English", "english", "literature", 2);
            
            System.out.println("✅ Default categories created.");
        }
    }

    private void createCategory(String name, String slug, String parentSlug, int order) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(slug);
        c.setParentSlug(parentSlug);
        c.setDisplayOrder(order);
        categoryRepository.save(c);
    }
}
