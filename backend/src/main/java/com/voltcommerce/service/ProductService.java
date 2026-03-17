package com.voltcommerce.service;

import com.voltcommerce.dto.ProductResponse;
import com.voltcommerce.entity.Product;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.exception.ResourceNotFoundException;
import com.voltcommerce.repository.ProductRepository;
import com.voltcommerce.repository.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final com.voltcommerce.repository.CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Product> spec = ProductSpecifications.filterProducts(
                category, minPrice, maxPrice, search
        );

        return productRepository.findAll(spec, pageable).map(ProductResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));

        if (!product.getActive()) {
            throw new ResourceNotFoundException("Product is not active");
        }

        return ProductResponse.fromEntity(product);
    }

    @Transactional
    public ProductResponse createProduct(com.voltcommerce.dto.AdminProductRequest request) {
        if (productRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new com.voltcommerce.exception.BadRequestException("Product slug already exists: " + request.getSlug());
        }

        com.voltcommerce.entity.Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .active(request.getActive())
                .build();

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, com.voltcommerce.dto.AdminProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Validar slug si cambió
        if (!product.getSlug().equals(request.getSlug()) && productRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new com.voltcommerce.exception.BadRequestException("Product slug already exists: " + request.getSlug());
        }

        com.voltcommerce.entity.Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        product.setActive(request.getActive());

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAdminProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(ProductResponse::fromEntity);
    }

    @Transactional
    public ProductResponse toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setActive(!product.getActive());
        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }

        long orderCount = productRepository.countOrderItemsByProductId(id);
        if (orderCount > 0) {
            throw new BadRequestException("Cannot delete product with existing orders. Deactivate it instead.");
        }

        productRepository.deleteById(id);
    }
}
