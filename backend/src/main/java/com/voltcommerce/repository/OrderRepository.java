package com.voltcommerce.repository;

import com.voltcommerce.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<Order> findByIdAndUserId(Long id, UUID userId);
    Optional<Order> findByStripePaymentId(String stripePaymentId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.total) FROM Order o WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') AND o.createdAt >= :after")
    java.math.BigDecimal sumTotalPaidAfter(java.time.LocalDateTime after);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :after")
    Long countOrdersAfter(java.time.LocalDateTime after);

    @org.springframework.data.jpa.repository.Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    java.util.List<Object[]> countOrdersByStatus();

    @org.springframework.data.jpa.repository.Query("SELECT CAST(o.createdAt AS date), SUM(o.total) FROM Order o WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') AND o.createdAt >= :after GROUP BY CAST(o.createdAt AS date) ORDER BY CAST(o.createdAt AS date) ASC")
    java.util.List<Object[]> sumRevenuePerDayAfter(java.time.LocalDateTime after);
}
