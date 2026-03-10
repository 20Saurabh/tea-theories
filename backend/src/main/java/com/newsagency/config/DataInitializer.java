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
            createCategory("National News", "national-news", null, 1);
            createCategory("International News", "international-news", null, 2);
            createCategory("Philosophy", "philosophy", null, 3);
            createCategory("Ethics", "ethics", null, 4);
            createCategory("Literature", "literature", null, 5);
            createCategory("Hindi", "hindi", "literature", 6);
            createCategory("English", "english", "literature", 7);
            createCategory("Others", "others", "literature", 8);
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
