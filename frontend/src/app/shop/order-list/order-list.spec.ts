import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { OrderListComponent } from './order-list';
import { environment } from '../../../environments/environment';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let httpMock: HttpTestingController;
  const ordersUrl = `${environment.apiUrl}/orders?page=0&size=10`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load orders', () => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne(ordersUrl);
    req.flush({ content: [{ id: 1, status: 'PAID', total: 100, items: [], createdAt: '2026-01-01' }] });

    expect(component).toBeTruthy();
    expect(component.orders.length).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('should start in loading state', () => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;

    expect(component.isLoading).toBe(true);

    fixture.detectChanges();
    httpMock.expectOne(ordersUrl).flush({ content: [] });
  });

  it('should set errorMessage on API failure', () => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne(ordersUrl);
    req.error(new ProgressEvent('error'));

    expect(component.errorMessage).toBeTruthy();
    expect(component.isLoading).toBe(false);
  });
});
