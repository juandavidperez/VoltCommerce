package com.voltcommerce.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.voltcommerce.dto.CheckoutRequest;
import com.voltcommerce.dto.CheckoutResponse;
import com.voltcommerce.dto.OrderItemResponse;
import com.voltcommerce.dto.OrderResponse;
import com.voltcommerce.entity.*;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CartRepository;
import com.voltcommerce.repository.OrderRepository;
import com.voltcommerce.repository.ProductRepository;
import com.voltcommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("No active cart found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal total = BigDecimal.ZERO;

        // 1. Verify stock and calculate total
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() + " (Available: " + product.getStock() + ")");
            }
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // 2. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(request.getShippingAddress());
        order.setTotal(total);

        // 3. Create OrderItems and decrease stock
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Decrease stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            // Add item with frozen unit price
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            order.addItem(orderItem);
        }

        // Save order and clear cart
        order = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);

        // 4. Create Stripe PaymentIntent
        try {
            Long amountInCents = total.multiply(BigDecimal.valueOf(100)).longValue();
            
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    // In the latest API version `automatic_payment_methods` is recommended
                    .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build()
                    )
                    .putMetadata("orderId", order.getId().toString())
                    .putMetadata("userId", user.getId().toString())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            
            order.setStripePaymentId(intent.getId());
            orderRepository.save(order);

            return new CheckoutResponse(intent.getClientSecret(), order.getId());
            
        } catch (StripeException e) {
            // If Stripe fails, the @Transactional will rollback everything (stock, order, cart)
            throw new RuntimeException("Error processing payment with Stripe: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToOrderResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or does not belong to user"));

        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapToOrderResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrdersFiltered(OrderStatus status, java.time.LocalDate from, java.time.LocalDate to, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Order> spec = org.springframework.data.jpa.domain.Specification.where(null);

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to.atTime(23, 59, 59)));
        }

        return orderRepository.findAll(spec, pageable).map(this::mapToOrderResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(status);
        return mapToOrderResponse(orderRepository.save(order));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .status(order.getStatus())
                .total(order.getTotal())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .items(order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImageUrl(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
