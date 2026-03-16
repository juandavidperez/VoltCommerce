import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OrderDetailComponent } from './order-detail';
import { environment } from '../../../environments/environment';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => '1' })
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/orders/1`).flush({ id: 1, status: 'PAID', items: [] });
    expect(component).toBeTruthy();
  });

  it('should have status steps defined', () => {
    expect(component.statusSteps).toEqual(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']);
  });

  it('should return correct step index for status', () => {
    expect(component.getStepIndex('PENDING')).toBe(0);
    expect(component.getStepIndex('PAID')).toBe(1);
    expect(component.getStepIndex('SHIPPED')).toBe(2);
    expect(component.getStepIndex('DELIVERED')).toBe(3);
    expect(component.getStepIndex('CANCELLED')).toBe(-1);
  });

  it('should set errorMessage on API failure', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/orders/1`);
    req.error(new ProgressEvent('error'));

    expect(component.errorMessage).toBe('Order not found or access denied.');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
