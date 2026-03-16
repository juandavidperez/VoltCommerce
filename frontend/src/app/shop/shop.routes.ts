import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CheckoutComponent } from './checkout/checkout';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success';
import { OrderListComponent } from './order-list/order-list';
import { OrderDetailComponent } from './order-detail/order-detail';
import { authGuard } from '../core/guards/auth.guard';

export const shopRoutes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [authGuard] },
  { path: ':slug', component: ProductDetailComponent }
];
