package com.voltcommerce.service;

import com.stripe.exception.StripeException;
import com.voltcommerce.dto.CheckoutRequest;
import com.voltcommerce.entity.*;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.repository.CartRepository;
import com.voltcommerce.repository.OrderRepository;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@test.com")
                .name("Test User")
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(BigDecimal.valueOf(100.00))
                .stock(5)
                .build();

        testCart = Cart.builder()
                .id(1L)
                .user(testUser)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser.getEmail(), null)
        );
    }

    @Test
    void checkout_ThrowsException_WhenCartIsEmpty() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));

        CheckoutRequest request = new CheckoutRequest("123 Test St");

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            orderService.checkout(request);
        });

        assertEquals("Cart is empty", exception.getMessage());
    }

    @Test
    void checkout_ThrowsException_WhenInsufficentStock() {
        CartItem cartItem = new CartItem();
        cartItem.setProduct(testProduct);
        cartItem.setQuantity(10); // More than stock (5)
        cartItem.setCart(testCart);
        testCart.getItems().add(cartItem);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));

        CheckoutRequest request = new CheckoutRequest("123 Test St");

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            orderService.checkout(request);
        });

        assertEquals("Insufficient stock for product: Test Product (Available: 5)", exception.getMessage());
    }

}
