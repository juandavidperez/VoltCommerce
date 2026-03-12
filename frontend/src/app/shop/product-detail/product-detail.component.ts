import { Component } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="card animate-fade-in-up">
        <div class="flex flex-col items-center justify-center py-20">
          <img src="assets/logo-icon.svg" alt="" class="h-16 w-auto mb-6 opacity-15">
          <h3 class="font-heading text-lg font-semibold text-ink-primary mb-2">Product detail page coming soon</h3>
          <p class="text-sm text-ink-secondary font-body max-w-sm text-center">
            Full product view with image, description, pricing, stock indicator, and Add to Cart will be built in Week 2.
          </p>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent {}
