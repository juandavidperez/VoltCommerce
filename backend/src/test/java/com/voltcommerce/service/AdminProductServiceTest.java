package com.voltcommerce.service;

import com.voltcommerce.dto.ProductResponse;
import com.voltcommerce.entity.Category;
import com.voltcommerce.entity.Product;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CategoryRepository;
import com.voltcommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product activeProduct;
    private Product inactiveProduct;
    private Category category;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(1L)
                .slug("electronics")
                .name("Electronics")
                .build();

        activeProduct = Product.builder()
                .id(1L)
                .name("Gaming Laptop")
                .slug("gaming-laptop")
                .price(BigDecimal.valueOf(1500.00))
                .stock(10)
                .active(true)
                .category(category)
                .build();

        inactiveProduct = Product.builder()
                .id(2L)
                .name("Old Keyboard")
                .slug("old-keyboard")
                .price(BigDecimal.valueOf(30.00))
                .stock(5)
                .active(false)
                .category(category)
                .build();
    }

    @Test
    void getAdminProducts_ShouldReturnAllProductsIncludingInactive() {
        Page<Product> pagedResponse = new PageImpl<>(List.of(activeProduct, inactiveProduct));
        when(productRepository.findAll(any(Pageable.class))).thenReturn(pagedResponse);

        Page<ProductResponse> result = productService.getAdminProducts(PageRequest.of(0, 10));

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().get(0).getActive());
        assertFalse(result.getContent().get(1).getActive());
        verify(productRepository).findAll(any(Pageable.class));
    }

    @Test
    void toggleProductActive_ShouldDeactivateActiveProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse result = productService.toggleProductActive(1L);

        assertFalse(result.getActive());
        verify(productRepository).save(activeProduct);
    }

    @Test
    void toggleProductActive_ShouldActivateInactiveProduct() {
        when(productRepository.findById(2L)).thenReturn(Optional.of(inactiveProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse result = productService.toggleProductActive(2L);

        assertTrue(result.getActive());
    }

    @Test
    void toggleProductActive_ShouldThrow_WhenProductNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.toggleProductActive(99L));
    }

    @Test
    void deleteProduct_ShouldThrow_WhenProductHasOrders() {
        when(productRepository.existsById(1L)).thenReturn(true);
        when(productRepository.countOrderItemsByProductId(1L)).thenReturn(5L);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> productService.deleteProduct(1L));
        assertTrue(ex.getMessage().contains("Cannot delete product with existing orders"));
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    void deleteProduct_ShouldSucceed_WhenProductHasNoOrders() {
        when(productRepository.existsById(1L)).thenReturn(true);
        when(productRepository.countOrderItemsByProductId(1L)).thenReturn(0L);

        productService.deleteProduct(1L);

        verify(productRepository).deleteById(1L);
    }

    @Test
    void deleteProduct_ShouldThrow_WhenProductNotFound() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> productService.deleteProduct(99L));
    }

    @Test
    void getProductBySlug_InactiveProduct_ShouldNotBeVisibleInPublicCatalog() {
        when(productRepository.findBySlug("old-keyboard")).thenReturn(Optional.of(inactiveProduct));

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductBySlug("old-keyboard"));
    }
}
