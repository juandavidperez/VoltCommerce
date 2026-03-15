import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, ProductFilters } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // State
  products: Product[] = [];
  categories: Category[] = [];
  loadingProducts = true;
  loadingCategories = true;
  addingToCartId: number | null = null;

  // Pagination State
  totalPages = 0;
  totalElements = 0;

  // Filters State
  filters: ProductFilters = {
    page: 0,
    size: 12,
    sortBy: 'createdAt',
    sortDir: 'desc'
  };

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();

    // Setup debounced search
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filters.search = searchTerm || undefined;
      this.filters.page = 0; // Reset to page 0 on new search
      this.loadProducts();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories() {
    this.loadingCategories = true;
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.loadingCategories = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load categories', err);
          this.loadingCategories = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadProducts() {
    this.loadingProducts = true;
    
    // Clean up empty strings from filters before sending to API
    const cleanFilters = { ...this.filters };
    if (!cleanFilters.search?.trim()) delete cleanFilters.search;
    
    this.productService.getProducts(cleanFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.products = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.loadingProducts = false;
          this.cdr.markForCheck();

          // Scroll to top when page changes and we have results
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        error: (err) => {
          console.error('Failed to load products', err);
          this.loadingProducts = false;
          this.cdr.markForCheck();
        }
      });
  }

  // --- Filter Event Handlers ---

  onCategoryChange(slug: string) {
    if (this.filters.category === slug) {
      this.filters.category = undefined; // Toggle off
    } else {
      this.filters.category = slug;
    }
    this.filters.page = 0;
    this.loadProducts();
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  onFilterChange() {
    // Handle manual max/min price inputs
    this.filters.page = 0;
    this.loadProducts();
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortDir] = value.split(',');
    
    this.filters.sortBy = sortBy;
    this.filters.sortDir = sortDir as 'asc' | 'desc';
    this.filters.page = 0;
    this.loadProducts();
  }

  onPageChange(pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.filters.page = pageIndex;
      this.loadProducts();
    }
  }

  clearSearch() {
    this.filters.search = undefined;
    this.filters.page = 0;
    this.loadProducts();
  }

  clearFilters() {
    this.filters = {
      page: 0,
      size: 12,
      sortBy: 'createdAt',
      sortDir: 'desc'
    };
    this.loadProducts();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.category || 
      this.filters.search || 
      this.filters.minPrice || 
      this.filters.maxPrice
    );
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    const current = this.filters.page || 0;
    
    let start = Math.max(0, current - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages - 1, start + maxVisiblePages - 1);
    
    // Adjust start if end hit the boundary
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(0, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // --- Cart Actions ---

  addToCart(product: Product) {
    if (product.stock <= 0) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.addingToCartId = product.id;
    
    this.cartService.addItem({ productId: product.id, quantity: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addingToCartId = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to add to cart', err);
          this.addingToCartId = null;
          this.cdr.markForCheck();
        }
      });
  }

  onImageError(event: any) {
    event.target.src = 'assets/placeholder-product.svg';
  }
}
