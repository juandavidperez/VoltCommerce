import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm text-gray-500">Monthly Sales</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm text-gray-500">Total Orders</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm text-gray-500">Active Products</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div class="bg-white rounded-xl shadow p-6">
          <p class="text-sm text-gray-500">Customers</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>
      <p class="text-gray-500 mt-8">Charts with ngx-charts coming in Week 4.</p>
    </div>
  `
})
export class AdminDashboardComponent {}
