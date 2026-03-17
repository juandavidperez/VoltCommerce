import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { DashboardStats } from '../../core/models/admin.model';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, CurrencyPipe],
  template: `
    <div class="animate-fade-in-up">
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-heading text-2xl font-bold text-ink-primary">Dashboard</h1>
        <button (click)="loadStats()" [disabled]="isLoading" class="btn-secondary !py-1.5 !px-3 text-xs">
          <svg [class.animate-spin]="isLoading" class="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      @if (isLoading && !stats) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          @for (i of [1,2,3,4]; track i) {
            <div class="card h-32 animate-pulse bg-gray-50 border-none shadow-none"></div>
          }
        </div>
      } @else if (stats) {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <!-- Monthly Revenue -->
          <div class="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-3">
              <div class="h-10 w-10 rounded-md bg-green-50 flex items-center justify-center">
                <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="badge" [class]="stats.revenueTrend >= 0 ? 'badge-success' : 'badge-error'">
                {{ stats.revenueTrend >= 0 ? '+' : '' }}{{ stats.revenueTrend | number:'1.0-1' }}%
              </span>
            </div>
            <p class="font-mono text-[28px] font-medium text-ink-primary leading-tight">{{ stats.monthlyRevenue | currency }}</p>
            <p class="text-xs font-body text-ink-secondary uppercase tracking-wider mt-1">Monthly Revenue</p>
          </div>

          <!-- Total Orders -->
          <div class="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-3">
              <div class="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span class="badge" [class]="stats.ordersTrend >= 0 ? 'badge-success' : 'badge-error'">
                {{ stats.ordersTrend >= 0 ? '+' : '' }}{{ stats.ordersTrend | number:'1.0-1' }}%
              </span>
            </div>
            <p class="font-mono text-[28px] font-medium text-ink-primary leading-tight">{{ stats.totalOrders }}</p>
            <p class="text-xs font-body text-ink-secondary uppercase tracking-wider mt-1">New Orders (30d)</p>
          </div>

          <!-- Active Products -->
          <div class="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-3">
              <div class="h-10 w-10 rounded-md bg-accent-muted flex items-center justify-center">
                <svg class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p class="font-mono text-[28px] font-medium text-ink-primary leading-tight">{{ stats.activeProducts }}</p>
            <p class="text-xs font-body text-ink-secondary uppercase tracking-wider mt-1">Active Products</p>
          </div>

          <!-- Customers -->
          <div class="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-3">
              <div class="h-10 w-10 rounded-md bg-purple-50 flex items-center justify-center">
                <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p class="font-mono text-[28px] font-medium text-ink-primary leading-tight">{{ stats.totalCustomers }}</p>
            <p class="text-xs font-body text-ink-secondary uppercase tracking-wider mt-1">Total Customers</p>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <!-- Revenue Chart -->
          <div class="card lg:col-span-2">
            <h3 class="font-heading text-base font-semibold text-ink-primary mb-6">Revenue (Last 30 Days)</h3>
            <div class="h-[300px] w-full">
              <ngx-charts-line-chart
                [scheme]="colorScheme"
                [results]="revenueResults"
                [gradient]="false"
                [xAxis]="true"
                [yAxis]="true"
                [legend]="false"
                [showXAxisLabel]="false"
                [showYAxisLabel]="false"
                [autoScale]="true"
                [animations]="true">
              </ngx-charts-line-chart>
            </div>
          </div>

          <!-- Orders Status Chart -->
          <div class="card">
            <h3 class="font-heading text-base font-semibold text-ink-primary mb-6">Orders by Status</h3>
            <div class="h-[300px] w-full">
              <ngx-charts-pie-chart
                [scheme]="colorScheme"
                [results]="stats.ordersByStatusChart"
                [gradient]="false"
                [legend]="true"
                [legendTitle]="''"
                [legendPosition]="legendBelow"
                [labels]="true"
                [doughnut]="true"
                [animations]="true">
              </ngx-charts-pie-chart>
            </div>
          </div>
        </div>

        <!-- Top Products & Low Stock -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Top 5 Products -->
          <div class="card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
              <h3 class="font-heading text-base font-semibold text-ink-primary">Top 5 Best Sellers</h3>
            </div>
            @if (stats.topProducts && stats.topProducts.length > 0) {
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="!text-right">Units Sold</th>
                    <th class="!text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  @for (product of stats.topProducts; track product.id) {
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          <img [src]="product.imageUrl || 'assets/placeholder-product.svg'" alt="" class="h-8 w-8 rounded object-contain bg-gray-50">
                          <span class="text-sm font-medium text-ink-primary line-clamp-1">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="!text-right"><span class="font-mono text-sm font-semibold text-ink-primary">{{ product.totalSold }}</span></td>
                      <td class="!text-right"><span class="font-mono text-sm text-ink-secondary">{{ product.price | currency }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="px-6 py-8 text-center text-ink-secondary text-sm">No sales data yet.</div>
            }
          </div>

          <!-- Low Stock Alert -->
          <div class="card p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-border flex items-center gap-2">
              <svg class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 class="font-heading text-base font-semibold text-ink-primary">Low Stock Alert (&lt; 10 units)</h3>
            </div>
            @if (stats.lowStockProducts && stats.lowStockProducts.length > 0) {
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th class="!text-right">Stock</th>
                    <th class="!text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  @for (product of stats.lowStockProducts; track product.id) {
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          <img [src]="product.imageUrl || 'assets/placeholder-product.svg'" alt="" class="h-8 w-8 rounded object-contain bg-gray-50">
                          <span class="text-sm font-medium text-ink-primary line-clamp-1">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="!text-right">
                        <span class="font-mono text-sm font-bold" [class]="product.stock === 0 ? 'text-error' : 'text-warning'">
                          {{ product.stock }}
                        </span>
                      </td>
                      <td class="!text-right"><span class="font-mono text-sm text-ink-secondary">{{ product.price | currency }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <div class="px-6 py-8 text-center text-success text-sm">All products are well stocked.</div>
            }
          </div>
        </div>
      } @else if (error) {
        <div class="card bg-error-bg border-error/20 p-6 text-center">
          <p class="text-error font-medium mb-3">{{ error }}</p>
          <button (click)="loadStats()" class="btn-primary !bg-error">Retry</button>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  stats: DashboardStats | null = null;
  isLoading = false;
  error: string | null = null;

  // Chart data formatted for ngx-charts
  revenueResults: any[] = [];
  legendBelow = LegendPosition.Below;
  colorScheme: any = {
    domain: ['#006064', '#00E5FF', '#FFEA00', '#AB1A1A', '#1B5E20']
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.adminService.getStats()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.formatChartData(data);
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Failed to load dashboard statistics. Please try again later.';
          console.error('Dashboard error:', err);
        }
      });
  }

  private formatChartData(stats: DashboardStats) {
    // ngx-charts line chart expects [{ name: 'Series', series: [{ name: 'X', value: Y }] }]
    this.revenueResults = [
      {
        name: 'Revenue',
        series: stats.revenueChart.map(point => ({
          name: point.name,
          value: point.value
        }))
      }
    ];
  }
}
