import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.html',
  styles: []
})
export class OrderListComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  orders: any[] = [];
  errorMessage: string | null = null;
  isLoading = true;

  ngOnInit() {
    this.fetchOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchOrders() {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderService.getUserOrders(0, 10).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        this.orders = response.content || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load your orders. Please try again later.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
