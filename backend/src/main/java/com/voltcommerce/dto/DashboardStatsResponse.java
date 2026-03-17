package com.voltcommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private BigDecimal monthlyRevenue;
    private BigDecimal revenueTrend; // Percentage
    
    private Long totalOrders;
    private BigDecimal ordersTrend; // Percentage
    
    private Long activeProducts;
    
    private Long totalCustomers;
    private BigDecimal customersTrend; // Percentage

    // Data for Revenue Chart (Last 30 days)
    private List<ChartDataPoint> revenueChart;
    
    // Data for Orders by Status Chart
    private List<ChartDataPoint> ordersByStatusChart;

    // Top 5 products by sales
    private List<ProductSummary> topProducts;

    // Products with low stock (< 10)
    private List<ProductSummary> lowStockProducts;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartDataPoint {
        private String name;
        private Object value;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductSummary {
        private Long id;
        private String name;
        private String imageUrl;
        private Integer stock;
        private BigDecimal price;
        private Long totalSold;
    }
}
