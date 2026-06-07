package com.handmade.service;

import com.handmade.dto.CategoryRequest;
import com.handmade.dto.CategoryResponse;
import com.handmade.entity.Category;
import com.handmade.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        return CategoryResponse.from(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên danh mục không được để trống");
        }

        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setActive(request.getActive() != null ? request.getActive() : true);

        Category savedCategory = categoryRepository.save(category);

        return CategoryResponse.from(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên danh mục không được để trống");
        }

        categoryRepository.findByName(request.getName().trim())
                .ifPresent(existingCategory -> {
                    if (!existingCategory.getId().equals(id)) {
                        throw new RuntimeException("Tên danh mục đã tồn tại");
                    }
                });

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());

        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updatedCategory = categoryRepository.save(category);

        return CategoryResponse.from(updatedCategory);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục");
        }

        categoryRepository.deleteById(id);
    }
}