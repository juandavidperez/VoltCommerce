import { Component, ElementRef, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { catchError, finalize, Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.html',
  styles: [`
    .StripeElement {
      box-sizing: border-box;
      height: 40px;
      padding: 10px 12px;
      border: 1px solid #d1d5db; /* gray-300 */
      border-radius: 4px;
      background-color: white;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      -webkit-transition: box-shadow 150ms ease;
      transition: box-shadow 150ms ease;
    }
    
    .StripeElement--focus {
      box-shadow: 0 1px 3px 0 #cfd7df;
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-color: #25ced1; /* primary cyn */
      ring-width: 2px;
    }

    .StripeElement--invalid {
      border-color: #ef4444; /* red-500 */
    }

    .StripeElement--webkit-autofill {
      background-color: #fefde5 !important;
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement') cardElementRef!: ElementRef;

  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  public authService = inject(AuthService);

  private destroy$ = new Subject<void>();
  
  checkoutForm!: FormGroup;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  cardError: string | null = null;
  serverError: string | null = null;
  isProcessing = false;

  cart$ = this.cartService.cart$;

  ngOnInit() {
    // Return early if empty cart
    if (this.cartService.getTotalItemsCount() === 0) {
      this.router.navigate(['/products']);
      return;
    }

    this.initForm();
    this.setupStripe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: ['', Validators.required]
    });
  }

  private async setupStripe() {
    this.stripe = await this.orderService.getStripe();
    if (this.stripe) {
      this.elements = this.stripe.elements();
      
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            color: '#111827', // ink-primary
            fontFamily: '"Inter", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#9ca3af' // gray-400
            }
          },
          invalid: {
            color: '#ef4444',
            iconColor: '#ef4444'
          }
        }
      });
      
      this.cardElement.mount(this.cardElementRef.nativeElement);

      this.cardElement.on('change', (event) => {
        if (event.error) {
          this.cardError = event.error.message;
        } else {
          this.cardError = null;
        }
      });
    }
  }

  async onSubmit() {
    if (this.checkoutForm.invalid || !this.stripe || !this.cardElement) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    this.serverError = null;
    this.cardError = null;

    // Build the concatenated string address
    const formVals = this.checkoutForm.value;
    const fullAddress = `${formVals.firstName} ${formVals.lastName}, ${formVals.address}, ${formVals.city}, ${formVals.country}, ${formVals.zipCode}`;

    this.orderService.createOrder({ shippingAddress: fullAddress })
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.serverError = err.error?.message || 'An error occurred while creating your order.';
          this.isProcessing = false;
          throw err;
        })
      )
      .subscribe(async (response) => {
        try {
          const result = await this.stripe!.confirmCardPayment(response.clientSecret, {
            payment_method: {
              card: this.cardElement!,
              billing_details: {
                name: `${formVals.firstName} ${formVals.lastName}`,
              }
            }
          });

          if (result.error) {
            this.serverError = result.error.message || 'Payment failed';
            this.isProcessing = false;
          } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            // Reload cart logic from the server to wipe UI
            this.cartService.loadCart().subscribe();
            
            // Re-route to success view
            this.router.navigate(['/checkout/success']);
          }
        } catch (e: any) {
          this.serverError = e.message || 'An unexpected error occurred';
          this.isProcessing = false;
        }
      });
  }

  get f() {
    return this.checkoutForm.controls;
  }
}
