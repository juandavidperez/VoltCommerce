package com.voltcommerce.service;

import com.voltcommerce.dto.ProductResponse;
import com.voltcommerce.entity.Product;
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
}
