package com.voltcommerce.controller;

import com.voltcommerce.dto.DashboardStatsResponse;
import com.voltcommerce.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Administrative endpoints for analytics and stats")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics and chart data")
    @ApiResponse(responseCode = "200", description = "Dashboard stats retrieved successfully")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(adminDashboardService.getStats());
    }
}
