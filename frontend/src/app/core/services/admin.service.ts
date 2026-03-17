import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, AdminProductRequest, AdminCategoryRequest } from '../models/admin.model';
import { ProductResponse, Page } from '../models/product.model';
import { CategoryResponse } from '../models/category.model';
import { OrderResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // Dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  // Products
  getAdminProducts(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<Page<ProductResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<Page<ProductResponse>>(`${this.apiUrl}/products`, { params });
  }

  createProduct(product: AdminProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: AdminProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/products/${id}`, product);
  }

  toggleProduct(id: number): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(`${this.apiUrl}/products/${id}/toggle`, {});
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Categories
  createCategory(category: AdminCategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: AdminCategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Orders
  getAllOrders(page = 0, size = 20, status?: string, from?: string, to?: string): Observable<Page<OrderResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (status) params = params.set('status', status);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<Page<OrderResponse>>(`${this.apiUrl}/orders`, { params });
  }

  updateOrderStatus(id: number, status: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/orders/${id}/status?status=${status}`, {});
  }
}
