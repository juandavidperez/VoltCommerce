package com.voltcommerce.repository;

import com.voltcommerce.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<Order> findByIdAndUserId(Long id, UUID userId);
    Optional<Order> findByStripePaymentId(String stripePaymentId);
}
