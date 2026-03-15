package com.voltcommerce.dto;

import com.voltcommerce.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long productId;
    private String name;
    private String slug;
    private String imageUrl;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;

    public static CartItemResponse fromEntity(CartItem cartItem) {
        if (cartItem == null || cartItem.getProduct() == null) return null;

        BigDecimal itemPrice = cartItem.getProduct().getPrice();
        BigDecimal subTotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemResponse.builder()
                .productId(cartItem.getProduct().getId())
                .name(cartItem.getProduct().getName())
                .slug(cartItem.getProduct().getSlug())
                .imageUrl(cartItem.getProduct().getImageUrl())
                .price(itemPrice)
                .quantity(cartItem.getQuantity())
                .subtotal(subTotal)
                .build();
    }
}
