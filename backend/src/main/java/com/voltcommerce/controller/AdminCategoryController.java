package com.voltcommerce.controller;

import com.voltcommerce.dto.AdminCategoryRequest;
import com.voltcommerce.dto.CategoryResponse;
import com.voltcommerce.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Categories", description = "Administrative endpoints for category management")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all categories")
    @ApiResponse(responseCode = "200", description = "List of categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    @Operation(summary = "Create a new category")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Category created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request or duplicate slug")
    })
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category updated successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody AdminCategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
