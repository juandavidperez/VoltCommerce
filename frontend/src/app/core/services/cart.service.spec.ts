import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { CartResponse } from '../models/cart.model';
import { environment } from '../../../environments/environment';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/cart`;

  const mockCart: CartResponse = {
    id: 1,
    items: [
      { productId: 10, name: 'Laptop', slug: 'laptop', imageUrl: '', price: 999, quantity: 2, subtotal: 1998 },
      { productId: 20, name: 'Mouse', slug: 'mouse', imageUrl: '', price: 25, quantity: 1, subtotal: 25 }
    ],
    total: 2023
  };

  const emptyCart: CartResponse = { id: 1, items: [], total: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit cart via cart$ after loadCart', () => {
    let emittedCart: CartResponse | null = null;
    service.cart$.subscribe(cart => emittedCart = cart);

    service.loadCart().subscribe();

    const req = httpMock.expectOne(apiUrl);
    req.flush(mockCart);

    expect(emittedCart).toEqual(mockCart);
  });

  it('should update getTotalItemsCount after loadCart', () => {
    expect(service.getTotalItemsCount()).toBe(0);

    service.loadCart().subscribe();
    httpMock.expectOne(apiUrl).flush(mockCart);

    expect(service.getTotalItemsCount()).toBe(3); // 2 + 1
  });

  it('should update cart$ after addItem', () => {
    const updatedCart: CartResponse = {
      id: 1,
      items: [...mockCart.items, { productId: 30, name: 'Keyboard', slug: 'keyboard', imageUrl: '', price: 75, quantity: 1, subtotal: 75 }],
      total: 2098
    };

    let emittedCart: CartResponse | null = null;
    service.cart$.subscribe(cart => emittedCart = cart);

    service.addItem({ productId: 30, quantity: 1 }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productId: 30, quantity: 1 });
    req.flush(updatedCart);

    expect(emittedCart).toEqual(updatedCart);
    expect(service.getTotalItemsCount()).toBe(4); // 2 + 1 + 1
  });

  it('should update cart$ after updateItemQuantity', () => {
    const updatedCart: CartResponse = {
      id: 1,
      items: [
        { productId: 10, name: 'Laptop', slug: 'laptop', imageUrl: '', price: 999, quantity: 5, subtotal: 4995 }
      ],
      total: 4995
    };

    let emittedCart: CartResponse | null = null;
    service.cart$.subscribe(cart => emittedCart = cart);

    service.updateItemQuantity(10, 5).subscribe();

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/items/10`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.params.get('quantity')).toBe('5');
    req.flush(updatedCart);

    expect(emittedCart).toEqual(updatedCart);
    expect(service.getTotalItemsCount()).toBe(5);
  });

  it('should update cart$ after removeItem', () => {
    // First load a cart
    service.loadCart().subscribe();
    httpMock.expectOne(apiUrl).flush(mockCart);
    expect(service.getTotalItemsCount()).toBe(3);

    // Remove an item
    service.removeItem(10).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/items/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush({
      id: 1,
      items: [{ productId: 20, name: 'Mouse', slug: 'mouse', imageUrl: '', price: 25, quantity: 1, subtotal: 25 }],
      total: 25
    });

    expect(service.getTotalItemsCount()).toBe(1);
  });

  it('should set cart$ to null after clearCart', () => {
    // First load a cart
    service.loadCart().subscribe();
    httpMock.expectOne(apiUrl).flush(mockCart);
    expect(service.getTotalItemsCount()).toBe(3);

    // Clear cart
    service.clearCart().subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.getTotalItemsCount()).toBe(0);
  });

  it('should return 0 from getTotalItemsCount when cart is null', () => {
    expect(service.getTotalItemsCount()).toBe(0);
  });
});
