import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <div class="min-h-screen flex flex-col bg-surface-app">
      <!-- Header -->
      <header class="bg-surface-card border-b border-border sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-2 group">
              <img src="assets/logo-icon.svg" alt="" class="h-8 w-auto transition-transform duration-200 group-hover:scale-110">
              <span class="text-xl font-heading font-bold text-ink-primary hidden sm:block">
                <span class="text-primary">Volt</span>Commerce
              </span>
            </a>

            <!-- Nav -->
            <nav class="hidden md:flex items-center gap-8">
              <a routerLink="/products" routerLinkActive="text-primary font-medium"
                 class="text-sm text-ink-secondary hover:text-primary transition-colors duration-150 font-body">
                Products
              </a>
            </nav>

            <!-- Right Side -->
            <div class="flex items-center gap-3">
              <!-- Cart -->
              <a routerLink="/cart"
                 class="relative p-2 rounded-md text-ink-secondary hover:text-primary hover:bg-primary-light transition-all duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </a>

              <!-- User Menu -->
              @if (currentUser$ | async; as user) {
                <div class="flex items-center gap-3">
                  <a routerLink="/orders"
                     class="text-sm text-ink-secondary hover:text-primary transition-colors font-body">My Orders</a>
                  @if (user.role === 'ADMIN') {
                    <a routerLink="/admin"
                       class="text-sm font-medium text-primary hover:text-primary-hover transition-colors font-body">Admin</a>
                  }
                  <div class="h-5 w-px bg-border"></div>
                  <button (click)="logout()"
                    class="text-sm text-ink-secondary hover:text-danger transition-colors font-body">Logout</button>
                </div>
              } @else {
                <a routerLink="/auth/login"
                   class="text-sm text-ink-secondary hover:text-primary transition-colors font-body">Sign in</a>
                <a routerLink="/auth/register"
                   class="btn-primary text-sm !py-2 !px-4">Get Started</a>
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
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <img src="assets/logo-icon.svg" alt="" class="h-5 w-auto opacity-50">
              <span class="text-sm text-ink-disabled font-body">VoltCommerce</span>
            </div>
            <p class="text-xs text-ink-disabled font-body">&copy; 2024 VoltCommerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class ShopLayoutComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
  }
}
