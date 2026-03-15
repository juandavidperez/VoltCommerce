package com.voltcommerce.service;

import com.voltcommerce.dto.CategoryResponse;
import com.voltcommerce.entity.Category;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Electronics")
                .slug("electronics")
                .description("Electronic devices")
                .build();
    }

    @Test
    void getAllCategories_ShouldReturnList() {
        when(categoryRepository.findAll()).thenReturn(List.of(testCategory));

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getName());
        verify(categoryRepository, times(1)).findAll();
    }

    @Test
    void getCategoryBySlug_ShouldReturnCategory_WhenSlugExists() {
        when(categoryRepository.findBySlug("electronics")).thenReturn(Optional.of(testCategory));

        CategoryResponse result = categoryService.getCategoryBySlug("electronics");

        assertNotNull(result);
        assertEquals("electronics", result.getSlug());
        verify(categoryRepository, times(1)).findBySlug("electronics");
    }

    @Test
    void getCategoryBySlug_ShouldThrowException_WhenSlugDoesNotExist() {
        when(categoryRepository.findBySlug(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryBySlug("unknown-slug"));
        verify(categoryRepository, times(1)).findBySlug("unknown-slug");
    }
}
