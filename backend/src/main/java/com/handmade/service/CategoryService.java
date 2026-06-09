package com.handmade.service;

import com.handmade.dto.CategoryRequest;
import com.handmade.dto.CategoryResponse;
import com.handmade.entity.Category;
import com.handmade.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .filter(category -> category.getActive() == null || category.getActive())
                .map(CategoryResponse::from)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        return CategoryResponse.from(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        validateCategoryRequest(request);

        String name = request.getName().trim();

        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }

        String slug = normalizeSlug(request.getSlug(), name);

        validateSlugNotTaken(slug, null);

        Category category = new Category();

        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());
        category.setActive(request.getActive() != null ? request.getActive() : true);

        Category savedCategory = categoryRepository.save(category);

        return CategoryResponse.from(savedCategory);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        validateCategoryRequest(request);

        String name = request.getName().trim();

        categoryRepository.findByName(name)
                .ifPresent(existingCategory -> {
                    if (!existingCategory.getId().equals(id)) {
                        throw new RuntimeException("Tên danh mục đã tồn tại");
                    }
                });

        String slug = normalizeSlug(request.getSlug(), name);

        validateSlugNotTaken(slug, id);

        category.setName(name);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());

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

    private void validateCategoryRequest(CategoryRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên danh mục không được để trống");
        }
    }

    private void validateSlugNotTaken(String slug, Long currentCategoryId) {
        boolean slugTaken = categoryRepository.findAll()
                .stream()
                .anyMatch(category ->
                        category.getSlug() != null
                                && category.getSlug().equals(slug)
                                && !category.getId().equals(currentCategoryId)
                );

        if (slugTaken) {
            throw new RuntimeException("Slug danh mục đã tồn tại");
        }
    }

    private String normalizeSlug(String slug, String fallbackName) {
        if (slug != null && !slug.trim().isEmpty()) {
            return generateSlug(slug);
        }

        return generateSlug(fallbackName);
    }

    private String generateSlug(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}