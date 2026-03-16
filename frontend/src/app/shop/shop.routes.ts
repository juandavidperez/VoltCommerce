import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const shopRoutes: Routes = [
  { path: '', component: ProductListComponent },
  { path: ':slug', component: ProductDetailComponent }
];
