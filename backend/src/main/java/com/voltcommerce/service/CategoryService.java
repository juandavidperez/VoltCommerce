package com.voltcommerce.service;

import com.voltcommerce.dto.CategoryResponse;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .map(CategoryResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
    }

    @Transactional
    public CategoryResponse createCategory(com.voltcommerce.dto.AdminCategoryRequest request) {
        if (categoryRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new com.voltcommerce.exception.BadRequestException("Category slug already exists: " + request.getSlug());
        }

        com.voltcommerce.entity.Category category = com.voltcommerce.entity.Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, com.voltcommerce.dto.AdminCategoryRequest request) {
        com.voltcommerce.entity.Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new com.voltcommerce.exception.BadRequestException("Category slug already exists: " + request.getSlug());
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
