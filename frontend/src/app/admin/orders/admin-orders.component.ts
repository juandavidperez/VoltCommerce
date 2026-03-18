import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { OrderResponse, OrderStatus } from '../../core/models/order.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="animate-fade-in-up">
      <div class="mb-6">
        <h1 class="font-heading text-2xl font-bold text-ink-primary">Orders</h1>
        <p class="text-sm text-ink-secondary font-body">Monitor and manage customer transactions</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          [(ngModel)]="filterStatus"
          (change)="onFilterChange()"
          class="form-input !py-2 text-sm bg-white shadow-sm ring-1 ring-gray-200 min-w-[150px]">
          <option value="">All Statuses</option>
          @for (status of statusOptions; track status) {
            <option [value]="status">{{ status }}</option>
          }
        </select>
        <div class="flex items-center gap-2">
          <label class="text-xs text-ink-secondary whitespace-nowrap">From:</label>
          <input
            type="date"
            [(ngModel)]="filterFrom"
            (change)="onFilterChange()"
            class="form-input !py-2 text-sm bg-white shadow-sm ring-1 ring-gray-200">
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-ink-secondary whitespace-nowrap">To:</label>
          <input
            type="date"
            [(ngModel)]="filterTo"
            (change)="onFilterChange()"
            class="form-input !py-2 text-sm bg-white shadow-sm ring-1 ring-gray-200">
        </div>
        @if (filterStatus || filterFrom || filterTo) {
          <button (click)="clearFilters()" class="btn-secondary !py-2 text-xs">Clear filters</button>
        }
      </div>

      <div class="card p-0 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Shipping Address</th>
                <th>Status</th>
                <th class="!text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading && orders.length === 0) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td colspan="6" class="p-0">
                      <div class="h-16 w-full animate-pulse bg-gray-50/50 border-b border-border/50"></div>
                    </td>
                  </tr>
                }
              } @else {
                @for (order of orders; track order.id) {
                  <tr class="group">
                    <td>
                      <span class="text-sm font-mono font-medium text-ink-primary">#{{ order.id }}</span>
                    </td>
                    <td>
                      <span class="text-sm text-ink-secondary">{{ order.createdAt | date:'medium' }}</span>
                    </td>
                    <td>
                      <span class="text-sm font-bold text-ink-primary font-mono">{{ order.total | currency }}</span>
                    </td>
                    <td>
                      <p class="text-xs text-ink-secondary line-clamp-1 max-w-[200px]" [title]="order.shippingAddress">
                        {{ order.shippingAddress }}
                      </p>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="!text-right">
                      <div class="flex items-center justify-end gap-2">
                         <select
                          (change)="updateStatus(order, $any($event.target).value)"
                          class="form-input !py-1 !px-2 text-xs bg-white shadow-sm ring-1 ring-gray-100 w-32">
                          @for (status of statusOptions; track status) {
                            <option [value]="status" [selected]="order.status === status">{{ status }}</option>
                          }
                        </select>
                      </div>
                    </td>
                  </tr>
                }
                @if (orders.length === 0 && !isLoading) {
                  <tr>
                    <td colspan="6" class="py-12 text-center text-ink-secondary">
                      No orders found.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 flex items-center justify-between border-t border-border bg-gray-50/30">
          <p class="text-xs text-ink-secondary font-body">Showing {{ orders.length }} items</p>
          <div class="flex items-center gap-1">
            <button
              (click)="onPageChange(currentPage - 1)"
              [disabled]="currentPage === 0 || isLoading"
              class="p-2 rounded hover:bg-white disabled:opacity-30 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span class="text-xs font-medium font-body px-3">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <button
              (click)="onPageChange(currentPage + 1)"
              [disabled]="currentPage >= totalPages - 1 || isLoading"
              class="p-2 rounded hover:bg-white disabled:opacity-30 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  orders: OrderResponse[] = [];
  isLoading = false;

  currentPage = 0;
  totalPages = 0;

  // Filters
  filterStatus = '';
  filterFrom = '';
  filterTo = '';

  statusOptions = Object.values(OrderStatus);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.adminService.getAllOrders(
      this.currentPage,
      20,
      this.filterStatus || undefined,
      this.filterFrom || undefined,
      this.filterTo || undefined
    )
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe(page => {
        this.orders = page.content;
        this.totalPages = page.totalPages;
        this.cdr.markForCheck();
      });
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadOrders();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.currentPage = 0;
    this.loadOrders();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOrders();
  }

  updateStatus(order: OrderResponse, newStatus: string) {
    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        order.status = updatedOrder.status;
        this.cdr.markForCheck();
      },
      error: (err) => {
        alert('Failed to update status. Please try again.');
        this.loadOrders();
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PAID: return 'badge-success';
      case OrderStatus.SHIPPED: return 'badge-warning !bg-blue-50 !text-blue-600 !border-blue-100';
      case OrderStatus.DELIVERED: return 'badge-success !bg-purple-50 !text-purple-600 !border-purple-100';
      case OrderStatus.CANCELLED: return 'badge-error';
      default: return 'badge-neutral';
    }
  }
}
