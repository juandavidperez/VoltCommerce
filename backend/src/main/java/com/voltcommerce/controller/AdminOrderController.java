package com.voltcommerce.controller;

import com.voltcommerce.dto.OrderResponse;
import com.voltcommerce.entity.OrderStatus;
import com.voltcommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Orders", description = "Administrative endpoints for order management")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders with filters and pagination")
    @ApiResponse(responseCode = "200", description = "Page of orders")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @Parameter(description = "Filter by order status") @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Filter from date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "Filter to date (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(orderService.getAllOrdersFiltered(
                status, from, to,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
