import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-success.html',
  styles: [`
    .success-animation {
      animation: checkmark 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }
    @keyframes checkmark {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class CheckoutSuccessComponent {
  private router = inject(Router);
  orderId: number | null = null;

  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.orderId = nav?.extras?.state?.['orderId'] ?? null;
  }
}
