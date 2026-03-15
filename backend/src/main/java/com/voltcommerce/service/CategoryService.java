package com.voltcommerce.service;

import com.voltcommerce.dto.CategoryResponse;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .map(CategoryResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
    }
}
