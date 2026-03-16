import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Observable, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.html',
  styles: []
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order$: Observable<any> | null = null;
  errorMessage: string | null = null;

  ngOnInit() {
    this.order$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.orderService.getOrderDetails(id).pipe(
          catchError(err => {
            this.errorMessage = 'Order not found or access denied.';
            return of(null);
          })
        );
      })
    );
  }
}
