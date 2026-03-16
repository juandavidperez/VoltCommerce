package com.voltcommerce.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.voltcommerce.entity.*;
import com.voltcommerce.repository.OrderRepository;
import com.voltcommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookControllerTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private StripeWebhookController controller;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(controller, "endpointSecret", "whsec_test");
    }

    @Test
    void handleStripeEvent_PaymentSucceeded_ChangesOrderStatusToPaid() {
        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .stripePaymentId("pi_test_123")
                .total(BigDecimal.valueOf(200.00))
                .build();

        PaymentIntent paymentIntent = mock(PaymentIntent.class);
        when(paymentIntent.getId()).thenReturn("pi_test_123");

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(deserializer.getObject()).thenReturn(Optional.of(paymentIntent));

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("payment_intent.succeeded");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        when(orderRepository.findByStripePaymentId("pi_test_123")).thenReturn(Optional.of(order));

        try (MockedStatic<Webhook> mockedWebhook = mockStatic(Webhook.class)) {
            mockedWebhook.when(() -> Webhook.constructEvent(any(), any(), any())).thenReturn(event);

            ResponseEntity<String> response = controller.handleStripeEvent("payload", "sig_header");

            assertEquals(200, response.getStatusCode().value());
            assertEquals(OrderStatus.PAID, order.getStatus());
            verify(orderRepository).save(order);
        }
    }

    @Test
    void handleStripeEvent_PaymentFailed_CancelsOrderAndRestoresStock() {
        Product product = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(BigDecimal.valueOf(100.00))
                .stock(3) // Stock was already deducted during checkout
                .build();

        OrderItem orderItem = OrderItem.builder()
                .id(1L)
                .product(product)
                .quantity(2)
                .unitPrice(BigDecimal.valueOf(100.00))
                .build();

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .stripePaymentId("pi_test_456")
                .total(BigDecimal.valueOf(200.00))
                .build();
        order.addItem(orderItem);

        PaymentIntent paymentIntent = mock(PaymentIntent.class);
        when(paymentIntent.getId()).thenReturn("pi_test_456");

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(deserializer.getObject()).thenReturn(Optional.of(paymentIntent));

        Event event = mock(Event.class);
        when(event.getType()).thenReturn("payment_intent.payment_failed");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

        when(orderRepository.findByStripePaymentId("pi_test_456")).thenReturn(Optional.of(order));

        try (MockedStatic<Webhook> mockedWebhook = mockStatic(Webhook.class)) {
            mockedWebhook.when(() -> Webhook.constructEvent(any(), any(), any())).thenReturn(event);

            ResponseEntity<String> response = controller.handleStripeEvent("payload", "sig_header");

            assertEquals(200, response.getStatusCode().value());
            assertEquals(OrderStatus.CANCELLED, order.getStatus());
            assertEquals(5, product.getStock(), "Stock should be restored (3 + 2)");
            verify(orderRepository).save(order);
            verify(productRepository).save(product);
        }
    }

    @Test
    void handleStripeEvent_InvalidSignature_Returns400() {
        try (MockedStatic<Webhook> mockedWebhook = mockStatic(Webhook.class)) {
            mockedWebhook.when(() -> Webhook.constructEvent(any(), any(), any()))
                    .thenThrow(new SignatureVerificationException("Invalid signature", "sig"));

            ResponseEntity<String> response = controller.handleStripeEvent("payload", "bad_sig");

            assertEquals(400, response.getStatusCode().value());
            verify(orderRepository, never()).save(any());
        }
    }
}
