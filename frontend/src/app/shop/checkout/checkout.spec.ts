import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { CheckoutComponent } from './checkout';
import { CartService } from '../../core/services/cart.service';

describe('CheckoutComponent', () => {
  let cartService: CartService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'products', component: CheckoutComponent }
        ])
      ]
    }).compileComponents();
  });

  it('should redirect to /products when cart is empty', () => {
    cartService = TestBed.inject(CartService);
    router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    // Cart is empty by default (getTotalItemsCount returns 0)
    expect(cartService.getTotalItemsCount()).toBe(0);

    const fixture = TestBed.createComponent(CheckoutComponent);
    const component = fixture.componentInstance;

    // Call ngOnInit manually - don't call detectChanges to avoid template error
    // since checkoutForm won't be initialized when cart is empty
    component.ngOnInit();

    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should initialize form when cart has items', () => {
    cartService = TestBed.inject(CartService);
    (cartService as any).cartSubject.next({
      id: 1,
      items: [{ productId: 1, name: 'Test', slug: 'test', imageUrl: '', price: 100, quantity: 1, subtotal: 100 }],
      total: 100
    });

    const fixture = TestBed.createComponent(CheckoutComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.checkoutForm).toBeDefined();
    expect(component.checkoutForm.get('firstName')).toBeTruthy();
    expect(component.checkoutForm.get('address')).toBeTruthy();
    expect(component.checkoutForm.get('city')).toBeTruthy();
    expect(component.checkoutForm.get('country')).toBeTruthy();
    expect(component.checkoutForm.get('zipCode')).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    cartService = TestBed.inject(CartService);
    (cartService as any).cartSubject.next({
      id: 1,
      items: [{ productId: 1, name: 'Test', slug: 'test', imageUrl: '', price: 100, quantity: 1, subtotal: 100 }],
      total: 100
    });

    const fixture = TestBed.createComponent(CheckoutComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onSubmit();

    expect(component.isProcessing).toBe(false);
  });
});
