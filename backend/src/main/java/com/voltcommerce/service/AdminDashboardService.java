package com.voltcommerce.service;

import com.voltcommerce.dto.DashboardStatsResponse;
import com.voltcommerce.repository.OrderRepository;
import com.voltcommerce.repository.ProductRepository;
import com.voltcommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.voltcommerce.entity.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo = now.minusDays(60);

        // 1. Revenue
        BigDecimal currentMonthRevenue = orderRepository.sumTotalPaidAfter(thirtyDaysAgo);
        if (currentMonthRevenue == null) currentMonthRevenue = BigDecimal.ZERO;
        
        BigDecimal lastMonthRevenue = orderRepository.sumTotalPaidAfter(sixtyDaysAgo);
        // This logic is a bit simple for "trend", but works for a demo
        BigDecimal revenueTrend = calculateTrend(currentMonthRevenue, lastMonthRevenue);

        // 2. Orders
        Long totalOrders = orderRepository.countOrdersAfter(thirtyDaysAgo);
        Long lastMonthOrders = orderRepository.countOrdersAfter(sixtyDaysAgo) - totalOrders;
        BigDecimal ordersTrend = calculateTrend(BigDecimal.valueOf(totalOrders), BigDecimal.valueOf(lastMonthOrders));

        // 3. Products
        Long activeProducts = productRepository.countByActiveTrue();

        // 4. Customers
        Long totalCustomers = userRepository.count();
        // Since we don't have createdAt for User yet, trend will be 0
        BigDecimal customersTrend = BigDecimal.ZERO;

        // 5. Revenue Chart
        List<Object[]> revenueData = orderRepository.sumRevenuePerDayAfter(thirtyDaysAgo);
        List<DashboardStatsResponse.ChartDataPoint> revenueChart = revenueData.stream()
                .map(row -> new DashboardStatsResponse.ChartDataPoint(row[0].toString(), row[1]))
                .collect(Collectors.toList());

        // 6. Orders by Status Chart
        List<Object[]> statusData = orderRepository.countOrdersByStatus();
        List<DashboardStatsResponse.ChartDataPoint> statusChart = statusData.stream()
                .map(row -> new DashboardStatsResponse.ChartDataPoint(row[0].toString(), row[1]))
                .collect(Collectors.toList());

        // 7. Top 5 Products by sales
        List<Object[]> topProductsData = productRepository.findTopSellingProducts();
        List<DashboardStatsResponse.ProductSummary> topProducts = topProductsData.stream()
                .map(row -> {
                    Product p = (Product) row[0];
                    Long totalSold = (Long) row[1];
                    return new DashboardStatsResponse.ProductSummary(
                            p.getId(), p.getName(), p.getImageUrl(), p.getStock(), p.getPrice(), totalSold);
                })
                .collect(Collectors.toList());

        // 8. Low stock products (< 10 units)
        List<DashboardStatsResponse.ProductSummary> lowStockProducts = productRepository
                .findByStockLessThanAndActiveTrue(10).stream()
                .map(p -> new DashboardStatsResponse.ProductSummary(
                        p.getId(), p.getName(), p.getImageUrl(), p.getStock(), p.getPrice(), null))
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .monthlyRevenue(currentMonthRevenue)
                .revenueTrend(revenueTrend)
                .totalOrders(totalOrders)
                .ordersTrend(ordersTrend)
                .activeProducts(activeProducts)
                .totalCustomers(totalCustomers)
                .customersTrend(customersTrend)
                .revenueChart(revenueChart)
                .ordersByStatusChart(statusChart)
                .topProducts(topProducts)
                .lowStockProducts(lowStockProducts)
                .build();
    }

    private BigDecimal calculateTrend(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
