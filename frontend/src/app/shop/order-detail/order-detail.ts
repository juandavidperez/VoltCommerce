import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  order$: Observable<any> | null = null;
  errorMessage: string | null = null;

  readonly statusSteps = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];

  ngOnInit() {
    this.order$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.orderService.getOrderDetails(id).pipe(
          catchError(err => {
            this.errorMessage = 'Order not found or access denied.';
            this.cdr.markForCheck();
            return of(null);
          })
        );
      })
    );
  }

  getStepIndex(status: string): number {
    if (status === 'CANCELLED') return -1;
    return this.statusSteps.indexOf(status);
  }
}
