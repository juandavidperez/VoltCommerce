import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="relative">
        <div class="h-10 w-10 rounded-full border-2 border-primary-light"></div>
        <div class="absolute top-0 left-0 h-10 w-10 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {}
