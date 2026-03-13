import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <div class="min-h-screen flex bg-surface-app">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-60 bg-surface-card border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()">

        <!-- Logo -->
        <div class="flex items-center gap-2.5 px-5 h-16 border-b border-border">
          <img src="assets/logo-icon.svg" alt="" class="h-7 w-auto">
          <span class="font-heading font-bold text-lg text-ink-primary">
            <span class="text-primary-text">Volt</span>Admin
          </span>
          <button (click)="sidebarOpen.set(false)" class="lg:hidden ml-auto text-ink-secondary hover:text-ink-primary transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 py-3 px-2 space-y-0.5">
          <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="nav-active"
             class="nav-item group">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="nav-active"
             class="nav-item group">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Products
          </a>
          <a routerLink="/admin/categories" routerLinkActive="nav-active"
             class="nav-item group">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Categories
          </a>
          <a routerLink="/admin/orders" routerLinkActive="nav-active"
             class="nav-item group">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Orders
          </a>
        </nav>

        <!-- Footer -->
        <div class="border-t border-border p-3">
          <a routerLink="/" class="nav-item text-ink-secondary hover:text-ink-primary">
            <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            Back to Store
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 lg:ml-60">
        <!-- Top Bar -->
        <header class="bg-surface-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <button (click)="sidebarOpen.set(true)" class="lg:hidden text-ink-secondary hover:text-ink-primary transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div></div>
          <div class="flex items-center gap-4">
            @if (currentUser$ | async; as user) {
              <span class="text-sm text-ink-secondary font-body">{{ user.name }}</span>
              <div class="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center">
                <span class="text-xs font-medium text-primary-text font-body">{{ user.name.charAt(0) }}</span>
              </div>
            }
            <button (click)="logout()"
              class="text-sm text-ink-secondary hover:text-danger transition-colors font-body">Logout</button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-6 max-w-[1280px] mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 400;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: background-color 0.15s ease, color 0.15s ease;
      cursor: pointer;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background-color: var(--color-bg-app);
      color: var(--color-text-primary);
    }

    .nav-item.nav-active {
      background-color: var(--color-primary-light);
      color: var(--color-primary-text);
      font-weight: 500;
      border-left-color: var(--color-accent);
      padding-left: 9px;
    }

    .nav-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  sidebarOpen = signal(false);
  currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
  }
}
