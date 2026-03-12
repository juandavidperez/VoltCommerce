import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  template: `
    <div>
      <h1 class="font-heading text-2xl font-bold text-ink-primary mb-6">Orders</h1>

      <div class="card animate-fade-in-up">
        <div class="flex items-center justify-center py-16">
          <div class="text-center">
            <div class="h-12 w-12 rounded-md bg-accent-muted flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-sm text-ink-secondary font-body">Order management coming in Week 4</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent {}
