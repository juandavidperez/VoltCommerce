package com.voltcommerce.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.voltcommerce.entity.Order;
import com.voltcommerce.entity.OrderStatus;
import com.voltcommerce.entity.Product;
import com.voltcommerce.repository.OrderRepository;
import com.voltcommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Error constructing Stripe event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded((PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null));
                break;
            case "payment_intent.payment_failed":
            case "payment_intent.canceled":
                handlePaymentIntentFailed((PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null));
                break;
            default:
                log.info("Unhandled Stripe event type: {}", event.getType());
        }

        return ResponseEntity.ok("Received");
    }

    private void handlePaymentIntentSucceeded(PaymentIntent paymentIntent) {
        if (paymentIntent != null) {
            orderRepository.findByStripePaymentId(paymentIntent.getId()).ifPresent(order -> {
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
                log.info("Order {} marked as PAID via Webhook", order.getId());
            });
        }
    }

    private void handlePaymentIntentFailed(PaymentIntent paymentIntent) {
        if (paymentIntent != null) {
            orderRepository.findByStripePaymentId(paymentIntent.getId()).ifPresent(order -> {
                order.setStatus(OrderStatus.CANCELLED);
                
                // Restock products
                order.getItems().forEach(item -> {
                    Product product = item.getProduct();
                    product.setStock(product.getStock() + item.getQuantity());
                    productRepository.save(product);
                });
                
                orderRepository.save(order);
                log.info("Order {} marked as CANCELLED and stock restored via Webhook", order.getId());
            });
        }
    }
}
