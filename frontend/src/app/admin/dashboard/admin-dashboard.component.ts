import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div>
      <h1 class="font-heading text-2xl font-bold text-ink-primary mb-6">Dashboard</h1>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        @for (kpi of kpis; track kpi.label; let i = $index) {
          <div class="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
               [class]="'animate-stagger-' + (i + 1)">
            <div class="flex items-start justify-between mb-3">
              <div class="h-10 w-10 rounded-md bg-accent-muted flex items-center justify-center">
                <svg class="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="kpi.icon" />
                </svg>
              </div>
              <span class="badge" [class]="kpi.trendUp ? 'badge-success' : 'badge-error'">
                {{ kpi.trendUp ? '+' : '' }}{{ kpi.trend }}
              </span>
            </div>
            <p class="font-mono text-[28px] font-medium text-ink-primary leading-tight">{{ kpi.value }}</p>
            <p class="text-xs font-body text-ink-secondary uppercase tracking-wider mt-1">{{ kpi.label }}</p>
          </div>
        }
      </div>

      <!-- Charts placeholder -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="card lg:col-span-2 animate-fade-in-up animate-stagger-3">
          <h3 class="font-heading text-lg font-semibold text-ink-primary mb-4">Revenue (Last 30 Days)</h3>
          <div class="h-64 flex items-center justify-center border border-dashed border-border rounded-md">
            <div class="text-center">
              <img src="assets/logo-icon.svg" alt="" class="h-8 w-auto mx-auto mb-3 opacity-20">
              <p class="text-sm text-ink-disabled font-body">Line chart coming in Week 4</p>
            </div>
          </div>
        </div>
        <div class="card animate-fade-in-up animate-stagger-4">
          <h3 class="font-heading text-lg font-semibold text-ink-primary mb-4">Orders by Status</h3>
          <div class="h-64 flex items-center justify-center border border-dashed border-border rounded-md">
            <div class="text-center">
              <img src="assets/logo-icon.svg" alt="" class="h-8 w-auto mx-auto mb-3 opacity-20">
              <p class="text-sm text-ink-disabled font-body">Donut chart coming in Week 4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  kpis = [
    {
      label: 'Monthly Revenue',
      value: '$0.00',
      trend: '0%',
      trendUp: true,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Total Orders',
      value: '0',
      trend: '0%',
      trendUp: true,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    },
    {
      label: 'Active Products',
      value: '15',
      trend: '15 total',
      trendUp: true,
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    },
    {
      label: 'Customers',
      value: '0',
      trend: '0%',
      trendUp: true,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    }
  ];
}
