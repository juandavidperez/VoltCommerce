import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './products/admin-products.component';
import { AdminCategoriesComponent } from './categories/admin-categories.component';
import { AdminOrdersComponent } from './orders/admin-orders.component';

export const adminRoutes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'products', component: AdminProductsComponent },
  { path: 'categories', component: AdminCategoriesComponent },
  { path: 'orders', component: AdminOrdersComponent }
];
