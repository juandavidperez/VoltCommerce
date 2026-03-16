import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Observable, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.html',
  styles: []
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  
  orders$: Observable<any> = of({ content: [] });
  errorMessage: string | null = null;
  isLoading = true;

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.isLoading = true;
    this.orders$ = this.orderService.getUserOrders(0, 10).pipe(
      catchError(err => {
        this.errorMessage = 'Failed to load your orders. Please try again later.';
        this.isLoading = false;
        return of({ content: [] });
      }),
      finalize(() => this.isLoading = false)
    ) as any;
  }
}
