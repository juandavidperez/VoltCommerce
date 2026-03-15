package com.voltcommerce.controller;

import com.voltcommerce.dto.ProductResponse;
import com.voltcommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Public endpoints for catalog products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all active products with filters and pagination")
    @ApiResponse(responseCode = "200", description = "Page of products")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @Parameter(description = "Category slug") @RequestParam(required = false) String category,
            @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Search phrase in name or description") @RequestParam(required = false) String search,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page") @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(productService.getProducts(
                category, minPrice, maxPrice, search, sortBy, sortDir, page, size
        ));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get a single active product by its slug")
    @ApiResponse(responseCode = "200", description = "Product details")
    @ApiResponse(responseCode = "404", description = "Product not found or inactive")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }
}
