import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './layouts/shop-layout/shop-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { CheckoutComponent } from './shop/checkout/checkout';
import { CheckoutSuccessComponent } from './shop/checkout-success/checkout-success';
import { OrderListComponent } from './shop/order-list/order-list';
import { OrderDetailComponent } from './shop/order-detail/order-detail';

export const routes: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadChildren: () => import('./shop/shop.routes').then(m => m.shopRoutes)
      },
      { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
      { path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [authGuard] },
      { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
      { path: 'orders/:id', component: OrderDetailComponent, canActivate: [authGuard] }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  { path: '**', redirectTo: '' }
];
