package com.voltcommerce.controller;

import com.voltcommerce.dto.AdminProductRequest;
import com.voltcommerce.dto.ProductResponse;
import com.voltcommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Products", description = "Administrative endpoints for product management")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List all products (including inactive) with pagination")
    @ApiResponse(responseCode = "200", description = "Page of products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        return ResponseEntity.ok(productService.getAdminProducts(PageRequest.of(page, size, Sort.by(direction, sortBy))));
    }

    @PostMapping
    @Operation(summary = "Create a new product")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request or duplicate slug")
    })
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody AdminProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody AdminProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle product active/inactive status")
    @ApiResponse(responseCode = "200", description = "Product status toggled successfully")
    public ResponseEntity<ProductResponse> toggleProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleProductActive(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product (only if it has no orders)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Product has existing orders"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
