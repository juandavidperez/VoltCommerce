import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartResponse, CartItemRequest } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;

  // Reactive state for the cart badge and quick view
  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  cart$ = this.cartSubject.asObservable();

  // Load initial cart
  loadCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItem(request: CartItemRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/items`, request).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateItemQuantity(productId: number, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.apiUrl}/items/${productId}`, null, {
      params: { quantity: quantity.toString() }
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(productId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/items/${productId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  // Helper utility to get the total items in the cart
  getTotalItemsCount(): number {
    const currentCart = this.cartSubject.value;
    if (!currentCart || !currentCart.items) return 0;
    
    return currentCart.items.reduce((total, item) => total + item.quantity, 0);
  }
}
