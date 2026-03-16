package com.voltcommerce.service;

import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.voltcommerce.dto.CheckoutRequest;
import com.voltcommerce.dto.CheckoutResponse;
import com.voltcommerce.entity.*;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.repository.CartRepository;
import com.voltcommerce.repository.OrderRepository;
import com.voltcommerce.repository.ProductRepository;
import com.voltcommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
    void checkout_ThrowsException_WhenInsufficientStock() {
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
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void checkout_CapturesUnitPriceAtPurchaseTime() {
        BigDecimal priceAtPurchase = BigDecimal.valueOf(99.99);
        testProduct.setPrice(priceAtPurchase);
        testProduct.setStock(10);

        CartItem cartItem = new CartItem();
        cartItem.setProduct(testProduct);
        cartItem.setQuantity(2);
        cartItem.setCart(testCart);
        testCart.getItems().add(cartItem);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        when(orderRepository.save(orderCaptor.capture())).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1L);
            return o;
        });

        PaymentIntent mockIntent = mock(PaymentIntent.class);
        when(mockIntent.getClientSecret()).thenReturn("pi_test_secret");
        when(mockIntent.getId()).thenReturn("pi_test_123");

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class))).thenReturn(mockIntent);

            CheckoutRequest request = new CheckoutRequest("123 Test St");
            CheckoutResponse response = orderService.checkout(request);

            assertNotNull(response);

            // Get the first save (before Stripe call) which contains the order items
            Order savedOrder = orderCaptor.getAllValues().get(0);
            assertEquals(1, savedOrder.getItems().size());

            OrderItem savedItem = savedOrder.getItems().get(0);
            assertEquals(0, priceAtPurchase.compareTo(savedItem.getUnitPrice()),
                    "unitPrice should capture the price at purchase time");
            assertEquals(2, savedItem.getQuantity());
        }
    }

    @Test
    void checkout_DeductsStockAndClearsCart() {
        testProduct.setStock(5);

        CartItem cartItem = new CartItem();
        cartItem.setProduct(testProduct);
        cartItem.setQuantity(3);
        cartItem.setCart(testCart);
        testCart.getItems().add(cartItem);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1L);
            return o;
        });

        PaymentIntent mockIntent = mock(PaymentIntent.class);
        when(mockIntent.getClientSecret()).thenReturn("pi_test_secret");
        when(mockIntent.getId()).thenReturn("pi_test_123");

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class))).thenReturn(mockIntent);

            CheckoutRequest request = new CheckoutRequest("123 Test St");
            orderService.checkout(request);

            // Stock should be deducted
            assertEquals(2, testProduct.getStock());

            // Cart should be cleared
            verify(cartRepository).save(testCart);
            assertTrue(testCart.getItems().isEmpty());
        }
    }
}
