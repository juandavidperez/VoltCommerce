import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = true;
  error = false;
  
  quantity = 1;
  isAddingToCart = false;

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(slug: string) {
    this.loading = true;
    this.error = false;
    this.quantity = 1;

    this.productService.getProductBySlug(slug)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (product) => {
          this.product = product;
        },
        error: (err) => {
          console.error('Failed to load product details', err);
          this.error = true;
        }
      });
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange() {
    if (!this.product) return;
    
    // Bounds check
    if (this.quantity < 1) {
      this.quantity = 1;
    } else if (this.quantity > this.product.stock) {
      this.quantity = this.product.stock;
    }
  }

  addToCart() {
    if (!this.product || this.product.stock <= 0 || this.quantity > this.product.stock) return;
    
    this.isAddingToCart = true;
    
    this.cartService.addItem({ 
      productId: this.product.id, 
      quantity: this.quantity 
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isAddingToCart = false)
    )
    .subscribe({
      next: () => {
        // Reset quantity visually after adding successfully
        this.quantity = 1;
      },
      error: (err) => {
        console.error('Failed to add multiple items to cart', err);
        // We'll rely on the global interceptor/error handler or future toast service
      }
    });
  }

  goToCategory(categorySlug: string) {
    this.router.navigate(['/products'], { queryParams: { category: categorySlug } });
  }

  onImageError(event: any) {
    event.target.src = 'assets/placeholder-product.svg';
  }
}
