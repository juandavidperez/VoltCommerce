import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CartDrawerComponent } from '../../shop/cart-drawer/cart-drawer.component';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, CartDrawerComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-surface-app">
      <!-- Header -->
      <header class="border-b border-border sticky top-0 z-50" style="background-color: rgb(37, 52, 70);">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-2 group">
              <img src="assets/logo-full.svg" alt="VoltCommerce" class="h-8 w-auto transition-transform duration-300 group-hover:scale-105">
            </a>

            <!-- Nav -->
            <div class="flex-1 flex justify-center ml-8 sm:ml-0">
              <nav class="hidden md:flex items-center gap-8">
                <a routerLink="/products" routerLinkActive="text-primary font-semibold"
                   class="text-sm text-gray-300 hover:text-primary transition-colors duration-150 font-body uppercase tracking-wider">
                  Products
                </a>
              </nav>
            </div>

            <!-- Right Side -->
            <div class="flex items-center gap-3 sm:gap-5">
              
              <!-- Cart Trigger -->
              <button 
                 (click)="openCart()"
                 class="relative p-2 rounded-full text-gray-300 hover:text-primary hover:bg-white/10 transition-all duration-150 group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                
                @if (cartItemCount > 0) {
                  <span class="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-fade-in-up">
                    {{ cartItemCount > 99 ? '99+' : cartItemCount }}
                  </span>
                }
              </button>

              <div class="h-6 w-px bg-gray-600 hidden sm:block"></div>

              <!-- User Menu -->
              @if (currentUser$ | async; as user) {
                <div class="hidden sm:flex items-center gap-4">
                  <a routerLink="/orders"
                     class="text-sm font-medium text-gray-300 hover:text-primary transition-colors font-body cursor-pointer">Orders</a>
                  
                  @if (user.role === 'ADMIN') {
                     <a routerLink="/admin"
                       class="text-sm font-bold text-white hover:text-gray-100 bg-primary px-3 py-1 rounded-full transition-colors font-body cursor-pointer">Admin</a>
                  }
                  
                  <button (click)="logout()"
                    class="text-sm font-medium text-gray-400 hover:text-danger transition-colors font-body cursor-pointer ml-2">Logout</button>
                </div>
                
              } @else {
                <div class="hidden sm:flex items-center gap-3">
                  <a routerLink="/auth/login"
                     class="text-sm font-medium text-gray-300 hover:text-primary transition-colors font-body cursor-pointer">Log in</a>
                  <a routerLink="/auth/register"
                     class="btn-primary text-sm !py-2 !px-4 shadow-sm border-none">Sign up</a>
                </div>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-surface-card border-t border-border mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img src="assets/logo-icon.svg" alt="" class="h-6 w-auto grayscale opacity-50">
              <div>
                <span class="block text-sm font-bold text-ink-primary font-heading">VoltCommerce</span>
                <span class="block text-xs text-ink-disabled font-body">Premium electronics & accessories</span>
              </div>
            </div>
            
            <div class="flex gap-6 text-sm text-ink-secondary font-body">
              <a href="#" class="hover:text-primary transition-colors">Terms</a>
              <a href="#" class="hover:text-primary transition-colors">Privacy</a>
              <a href="#" class="hover:text-primary transition-colors">Support</a>
            </div>
            
            <p class="text-xs text-ink-disabled font-body">&copy; 2026 VoltCommerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <!-- Cart Drawer -->
      <app-cart-drawer #cartDrawer></app-cart-drawer>
    </div>
  `
})
export class ShopLayoutComponent implements OnInit {
  @ViewChild('cartDrawer') cartDrawer!: CartDrawerComponent;

  private authService = inject(AuthService);
  private cartService = inject(CartService);

  currentUser$ = this.authService.currentUser$;
  cartItemCount = 0;

  ngOnInit() {
    // Only load cart if we have a user logged in (or relying on auth interceptor to not fail)
    this.currentUser$.subscribe(user => {
      if (user) {
        this.cartService.loadCart().subscribe();
      }
    });

    // Subscribe to cart changes to update local count efficiently
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getTotalItemsCount();
    });
  }

  openCart() {
    this.cartDrawer.open();
  }

  logout(): void {
    this.cartService.clearCart().subscribe(() => {
      this.authService.logout();
    });
  }
}
