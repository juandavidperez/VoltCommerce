import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-heading text-2xl font-bold text-ink-primary">Products</h1>
        <button class="btn-primary text-sm" disabled>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </button>
      </div>

      <div class="card animate-fade-in-up">
        <div class="flex items-center justify-center py-16">
          <div class="text-center">
            <div class="h-12 w-12 rounded-md bg-accent-muted flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-sm text-ink-secondary font-body">Product management table coming in Week 4</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProductsComponent {}
