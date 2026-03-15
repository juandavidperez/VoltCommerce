package com.voltcommerce.repository;

import com.voltcommerce.entity.Product;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

public class ProductSpecifications {

    public static Specification<Product> filterProducts(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search
    ) {
        return Specification.where(isActive())
                .and(hasCategory(category))
                .and(priceGreaterThanOrEqual(minPrice))
                .and(priceLessThanOrEqual(maxPrice))
                .and(searchInNameOrDescription(search));
    }

    private static Specification<Product> isActive() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("active"));
    }

    private static Specification<Product> hasCategory(String categorySlug) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(categorySlug)) {
                return null;
            }
            return criteriaBuilder.equal(
                    root.join("category", JoinType.INNER).get("slug"),
                    categorySlug
            );
        };
    }

    private static Specification<Product> priceGreaterThanOrEqual(BigDecimal minPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null) {
                return null;
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice);
        };
    }

    private static Specification<Product> priceLessThanOrEqual(BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (maxPrice == null) {
                return null;
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    private static Specification<Product> searchInNameOrDescription(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return null;
            }
            
            String pattern = "%" + searchTerm.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern)
            );
        };
    }
}
