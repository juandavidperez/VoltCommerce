import { Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Page Header -->
      <div class="mb-8 animate-fade-in-up">
        <h1 class="font-heading text-3xl font-bold text-ink-primary mb-2">Products</h1>
        <p class="text-sm text-ink-secondary font-body">Browse our collection of premium electronics</p>
      </div>

      <div class="flex gap-8">
        <!-- Sidebar Filters (placeholder) -->
        <aside class="hidden lg:block w-[260px] flex-shrink-0 animate-fade-in-up animate-stagger-1">
          <div class="card sticky top-24">
            <h3 class="font-heading text-sm font-semibold text-ink-primary mb-4 uppercase tracking-wider">Filters</h3>

            <div class="mb-5">
              <p class="form-label">Category</p>
              <div class="space-y-2 mt-2">
                @for (cat of categories; track cat) {
                  <label class="flex items-center gap-2 cursor-pointer text-sm text-ink-secondary hover:text-ink-primary transition-colors font-body">
                    <input type="checkbox" class="accent-primary w-4 h-4 rounded">
                    {{ cat }}
                  </label>
                }
              </div>
            </div>

            <div class="mb-5">
              <p class="form-label">Price Range</p>
              <div class="flex gap-2 mt-2">
                <input type="number" placeholder="Min" class="form-input !py-2 !text-xs font-mono">
                <input type="number" placeholder="Max" class="form-input !py-2 !text-xs font-mono">
              </div>
            </div>

            <div>
              <p class="form-label">Sort By</p>
              <select class="form-input !py-2 mt-2 text-sm">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Name A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Product Grid (placeholder) -->
        <div class="flex-1">
          <!-- Search Bar -->
          <div class="mb-6 animate-fade-in-up animate-stagger-2">
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search products..." class="form-input !pl-10">
            </div>
          </div>

          <!-- Empty State -->
          <div class="card animate-fade-in-up animate-stagger-3">
            <div class="flex flex-col items-center justify-center py-20">
              <img src="assets/logo-icon.svg" alt="" class="h-16 w-auto mb-6 opacity-15">
              <h3 class="font-heading text-lg font-semibold text-ink-primary mb-2">Product catalog coming soon</h3>
              <p class="text-sm text-ink-secondary font-body max-w-sm text-center">
                The product grid with cards, images, prices, and "Add to Cart" buttons will be built in Week 2.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent {
  categories = ['Laptops', 'Smartphones', 'Audio', 'Gaming', 'Accessories', 'Monitors'];
}
