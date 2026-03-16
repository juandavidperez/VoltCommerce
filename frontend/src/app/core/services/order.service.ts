import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

export interface CheckoutRequest {
  shippingAddress: string;
}

export interface CheckoutResponse {
  clientSecret: string;
  orderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;
  private stripePromise = loadStripe(environment.stripePublicKey);

  createOrder(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout`, request);
  }

  getUserOrders(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getOrderDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }
}
