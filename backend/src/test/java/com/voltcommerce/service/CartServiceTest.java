package com.voltcommerce.service;

import com.voltcommerce.dto.CartItemRequest;
import com.voltcommerce.dto.CartResponse;
import com.voltcommerce.entity.Cart;
import com.voltcommerce.entity.CartItem;
import com.voltcommerce.entity.Product;
import com.voltcommerce.entity.User;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CartRepository;
import com.voltcommerce.repository.ProductRepository;
import com.voltcommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Product testProduct;
    private Cart testCart;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .name("Test User")
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .slug("test-product")
                .price(BigDecimal.valueOf(100.00))
                .stock(5)
                .active(true)
                .build();

        testCart = Cart.builder()
                .id(1L)
                .user(testUser)
                .items(new ArrayList<>())
                .build();

        // Mock security context
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser.getEmail(), null, new ArrayList<>())
        );
    }

    @Test
    void getCart_ShouldCreateNewCart_WhenItDoesNotExist() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        CartResponse result = cartService.getCart();

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void addItem_ShouldAddNewItem_WhenStockIsValid() {
        mockUserAndCart();
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        CartItemRequest request = new CartItemRequest(testProduct.getId(), 2);
        
        CartResponse result = cartService.addItem(request);

        assertNotNull(result);
        verify(cartRepository, times(1)).save(any(Cart.class));
        assertEquals(1, testCart.getItems().size());
        assertEquals(2, testCart.getItems().get(0).getQuantity());
    }

    @Test
    void addItem_ShouldThrowException_WhenProductDoesNotExist() {
        mockUserAndCart();
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.empty());

        CartItemRequest request = new CartItemRequest(testProduct.getId(), 2);

        assertThrows(ResourceNotFoundException.class, () -> cartService.addItem(request));
    }

    @Test
    void addItem_ShouldThrowException_WhenExceedingStock() {
        mockUserAndCart();
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));

        // Request 10 items, but only 5 in stock
        CartItemRequest request = new CartItemRequest(testProduct.getId(), 10);

        assertThrows(BadRequestException.class, () -> cartService.addItem(request));
    }

    @Test
    void addItem_ShouldIncreaseQuantity_WhenItemAlreadyInCart() {
        mockUserAndCart();
        
        // Setup initial cart with 1 product
        CartItem existingItem = CartItem.builder().product(testProduct).quantity(2).build();
        testCart.getItems().add(existingItem);
        
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Add 2 more of the same product
        CartItemRequest request = new CartItemRequest(testProduct.getId(), 2);
        cartService.addItem(request);

        assertEquals(1, testCart.getItems().size());
        assertEquals(4, testCart.getItems().get(0).getQuantity());
    }

    @Test
    void removeItem_ShouldRemoveItem_WhenItExists() {
        mockUserAndCart();
        CartItem existingItem = CartItem.builder().product(testProduct).quantity(2).build();
        testCart.getItems().add(existingItem);
        
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        cartService.removeItem(testProduct.getId());

        assertTrue(testCart.getItems().isEmpty());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    private void mockUserAndCart() {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
    }
}
