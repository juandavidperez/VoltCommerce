package com.voltcommerce.service;

import com.voltcommerce.entity.Category;
import com.voltcommerce.entity.Product;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        Category category = Category.builder()
                .id(1L)
                .slug("electronics")
                .name("Electronics")
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Laptop Gaming")
                .slug("laptop-gaming")
                .price(BigDecimal.valueOf(1500.00))
                .stock(10)
                .active(true)
                .category(category)
                .build();
    }

    @Test
    @SuppressWarnings("unchecked")
    void getProducts_ShouldReturnPagedResults() {
        Page<Product> pagedResponse = new PageImpl<>(List.of(testProduct));
        
        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(pagedResponse);

        Page<Product> result = productService.getProducts(
                "electronics", null, null, null, "createdAt", "desc", 0, 12
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Laptop Gaming", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getProductBySlug_ShouldReturnProduct_WhenActiveAndFound() {
        when(productRepository.findBySlug("laptop-gaming")).thenReturn(Optional.of(testProduct));

        Product result = productService.getProductBySlug("laptop-gaming");

        assertNotNull(result);
        assertEquals("Laptop Gaming", result.getName());
        assertTrue(result.getActive());
    }

    @Test
    void getProductBySlug_ShouldThrowException_WhenProductDoesNotExist() {
        when(productRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductBySlug("unknown"));
    }

    @Test
    void getProductBySlug_ShouldThrowException_WhenProductIsInactive() {
        testProduct.setActive(false);
        when(productRepository.findBySlug("laptop-gaming")).thenReturn(Optional.of(testProduct));

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductBySlug("laptop-gaming"));
    }
}
