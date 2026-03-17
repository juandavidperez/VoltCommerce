package com.voltcommerce.repository;

import com.voltcommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    long countByActiveTrue();

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.id = :productId")
    long countOrderItemsByProductId(@Param("productId") Long productId);

    List<Product> findByStockLessThanAndActiveTrue(int threshold);

    @Query("SELECT oi.product, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
           "GROUP BY oi.product ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();
}
