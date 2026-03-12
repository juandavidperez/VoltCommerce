import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-heading text-2xl font-bold text-ink-primary">Categories</h1>
        <button class="btn-primary text-sm" disabled>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
      </div>

      <div class="card animate-fade-in-up">
        <div class="flex items-center justify-center py-16">
          <div class="text-center">
            <div class="h-12 w-12 rounded-md bg-accent-muted flex items-center justify-center mx-auto mb-4">
              <svg class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p class="text-sm text-ink-secondary font-body">Category management coming in Week 4</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminCategoriesComponent {}
