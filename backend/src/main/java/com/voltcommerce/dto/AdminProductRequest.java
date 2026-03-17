package com.voltcommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @PositiveOrZero(message = "Stock must be positive or zero")
    private Integer stock;

    private String imageUrl;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Builder.Default
    private Boolean active = true;
}
