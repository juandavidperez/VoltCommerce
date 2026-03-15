package com.voltcommerce.service;

import com.voltcommerce.dto.CartItemRequest;
import com.voltcommerce.dto.CartResponse;
import com.voltcommerce.entity.Cart;
import com.voltcommerce.entity.CartItem;
import com.voltcommerce.entity.Product;
import com.voltcommerce.entity.User;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.CartRepository;
import com.voltcommerce.repository.ProductRepository;
import com.voltcommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse getCart() {
        Cart cart = getOrCreateCartForCurrentUser();
        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public CartResponse addItem(CartItemRequest request) {
        Cart cart = getOrCreateCartForCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getActive()) {
            throw new BadRequestException("Product is not active");
        }

        Optional<CartItem> existingItemOptional = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOptional.isPresent()) {
            CartItem existingItem = existingItemOptional.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            
            if (newQuantity > product.getStock()) {
                throw new BadRequestException("Cannot add " + request.getQuantity() + " items. Only " + product.getStock() + " available in stock. You already have " + existingItem.getQuantity() + " in cart.");
            }
            
            existingItem.setQuantity(newQuantity);
        } else {
            if (request.getQuantity() > product.getStock()) {
                throw new BadRequestException("Requested quantity exceeds available stock");
            }
            
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return CartResponse.fromEntity(savedCart);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long productId, Integer quantity) {
        if (quantity < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        Cart cart = getOrCreateCartForCurrentUser();
        
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        Product product = cartItem.getProduct();
        
        if (quantity > product.getStock()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }

        cartItem.setQuantity(quantity);
        
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.fromEntity(savedCart);
    }

    @Transactional
    public CartResponse removeItem(Long productId) {
        Cart cart = getOrCreateCartForCurrentUser();
        
        boolean removed = cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        
        if (!removed) {
            throw new ResourceNotFoundException("Item not found in cart");
        }
        
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.fromEntity(savedCart);
    }

    @Transactional
    public void clearCart() {
        Cart cart = getOrCreateCartForCurrentUser();
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Cart getOrCreateCartForCurrentUser() {
        User user = getCurrentUser();
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
