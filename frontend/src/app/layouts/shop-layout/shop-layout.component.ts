import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a routerLink="/" class="text-2xl font-bold text-indigo-600">VoltCommerce</a>

            <!-- Nav Links -->
            <nav class="hidden md:flex items-center space-x-8">
              <a routerLink="/products" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 transition">Products</a>
            </nav>

            <!-- Right Side -->
            <div class="flex items-center space-x-4">
              <!-- Cart -->
              <a routerLink="/cart" class="relative text-gray-700 hover:text-indigo-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </a>

              <!-- User Menu -->
              @if (currentUser$ | async; as user) {
                <div class="flex items-center space-x-3">
                  <a routerLink="/orders" class="text-sm text-gray-700 hover:text-indigo-600">My Orders</a>
                  @if (user.role === 'ADMIN') {
                    <a routerLink="/admin" class="text-sm text-indigo-600 font-medium">Admin</a>
                  }
                  <button (click)="logout()" class="text-sm text-gray-500 hover:text-red-500">Logout</button>
                </div>
              } @else {
                <a routerLink="/auth/login" class="text-sm text-gray-700 hover:text-indigo-600">Login</a>
                <a routerLink="/auth/register" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">Register</a>
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
      <footer class="bg-white border-t mt-auto">
        <div class="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          &copy; 2024 VoltCommerce. All rights reserved.
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
