import { Component, inject, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CartResponse } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-ink-primary/40 backdrop-blur-sm z-50 transition-opacity duration-300"
      [class.opacity-100]="isOpen"
      [class.opacity-0]="!isOpen"
      [class.pointer-events-none]="!isOpen"
      (click)="close()">
    </div>

    <!-- Drawer panel -->
    <div 
      class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-app shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pointer-events-auto"
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen">
      
      <!-- Header -->
      <div class="px-6 py-4 flex items-center justify-between border-b border-border bg-surface-card">
        <h2 class="font-heading text-xl font-bold text-ink-primary flex items-center gap-3">
          Your Cart
          @if (cart && cart.items.length > 0) {
            <span class="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full inline-block">
              {{ cart.items.length }} 
            </span>
          }
        </h2>
        <button 
          (click)="close()" 
          class="p-2 -mr-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary rounded-full transition-colors">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        @if (!cart || cart.items.length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center text-ink-secondary pt-12">
            <div class="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center mb-6">
              <svg class="w-12 h-12 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 class="font-heading text-lg font-bold text-ink-primary mb-2">Your cart is empty</h3>
            <p class="font-body text-sm mb-8 px-4">Looks like you haven't added any products to your cart yet.</p>
            <button (click)="close()" class="btn-primary" routerLink="/products">
              Start Shopping
            </button>
          </div>
        } @else {
          <ul class="space-y-6">
            @for (item of cart.items; track item.productId) {
              <li class="flex gap-4 p-4 rounded-xl bg-surface-card border border-border shadow-sm group">
                <!-- Image -->
                <a [routerLink]="['/products', item.slug]" (click)="close()" class="flex-shrink-0 w-20 h-20 bg-white rounded-lg border border-border p-2 self-start flex items-center justify-center">
                  <img 
                    [src]="item.imageUrl || 'assets/placeholder-product.svg'" 
                    [alt]="item.name"
                    class="max-w-full max-h-full object-contain">
                </a>

                <!-- Details -->
                <div class="flex-1 flex flex-col min-w-0">
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <a [routerLink]="['/products', item.slug]" (click)="close()" class="truncate block">
                      <h4 class="font-heading font-semibold text-sm text-ink-primary truncate hover:text-primary transition-colors">
                        {{ item.name }}
                      </h4>
                    </a>
                    <button 
                      (click)="removeItem(item.productId)"
                      [disabled]="isUpdating"
                      class="text-ink-muted hover:text-danger p-1 -mr-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                      title="Remove">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <p class="font-mono text-sm font-semibold text-ink-primary mb-3">
                    {{ item.price | currency }}
                  </p>
                  
                  <div class="flex items-center justify-between mt-auto">
                    <!-- Quantity Controls -->
                    <div class="flex items-center border border-border rounded-md bg-white">
                      <button 
                        (click)="updateQuantity(item.productId, item.quantity - 1)"
                        [disabled]="item.quantity <= 1 || isUpdating"
                        class="w-7 h-7 flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span class="w-8 text-center font-mono text-sm font-medium">
                        {{ item.quantity }}
                      </span>
                      
                      <button 
                        (click)="updateQuantity(item.productId, item.quantity + 1)"
                        [disabled]="isUpdating"
                        class="w-7 h-7 flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    
                    <span class="font-mono text-sm font-bold text-ink-primary ml-4 text-right">
                      {{ item.subtotal | currency }}
                    </span>
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      </div>

      <!-- Footer Summary -->
      @if (cart && cart.items.length > 0) {
        <div class="p-6 border-t border-border bg-surface-card mt-auto">
          <div class="flex justify-between items-center mb-6">
            <span class="font-body text-ink-secondary">Subtotal</span>
            <span class="font-mono text-xl font-bold text-ink-primary">{{ cart.total | currency }}</span>
          </div>
          
          <p class="text-xs text-ink-muted mb-6 text-center">Taxes and shipping calculated at checkout.</p>
          
          <button 
            (click)="checkout()"
            class="btn-primary w-full shadow-lg shadow-primary/20 h-12 text-base">
            Proceed to Checkout
          </button>
        </div>
      }
    </div>
  `
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<void>();
  
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  isOpen = false;
  cart: CartResponse | null = null;
  isUpdating = false;

  ngOnInit() {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        this.isUpdating = false;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  open() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  close() {
    this.isOpen = false;
    document.body.style.overflow = ''; // Restore background scrolling
    setTimeout(() => this.closed.emit(), 300); // Allow animation to complete
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    this.isUpdating = true;
    this.cartService.updateItemQuantity(productId, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err: unknown) => {
          console.error('Failed to update quantity', err);
          this.isUpdating = false;
          this.cdr.markForCheck();
        }
      });
  }

  removeItem(productId: number) {
    this.isUpdating = true;
    this.cartService.removeItem(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err: unknown) => {
          console.error('Failed to remove item', err);
          this.isUpdating = false;
          this.cdr.markForCheck();
        }
      });
  }

  checkout() {
    this.close();
    // Intentionally left with alerts as Stripe is Week 3
    alert('Checkout flow will be implemented in Week 3 (Stripe Integration)');
  }
}
