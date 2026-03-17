import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../../core/models/admin.model';

const mockStats: DashboardStats = {
  monthlyRevenue: 15000,
  revenueTrend: 12.5,
  totalOrders: 42,
  ordersTrend: 8.3,
  activeProducts: 25,
  totalCustomers: 100,
  customersTrend: 0,
  revenueChart: [
    { name: '2026-03-01', value: 500 },
    { name: '2026-03-02', value: 750 }
  ],
  ordersByStatusChart: [
    { name: 'PAID', value: 20 },
    { name: 'SHIPPED', value: 15 },
    { name: 'DELIVERED', value: 7 }
  ],
  topProducts: [
    { id: 1, name: 'Gaming Laptop', imageUrl: null, stock: 10, price: 1500, totalSold: 50 },
    { id: 2, name: 'Wireless Mouse', imageUrl: null, stock: 25, price: 40, totalSold: 30 }
  ],
  lowStockProducts: [
    { id: 3, name: 'USB Cable', imageUrl: null, stock: 3, price: 10, totalSold: null }
  ]
};

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let httpMock: HttpTestingController;
  const statsUrl = `${environment.apiUrl}/admin/dashboard/stats`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
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

  it('should create and load stats', () => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne(statsUrl);
    req.flush(mockStats);

    expect(component).toBeTruthy();
    expect(component.stats).toBeTruthy();
    expect(component.isLoading).toBe(false);
  });

  it('should format revenue chart data for ngx-charts line chart', () => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(statsUrl).flush(mockStats);

    // ngx-charts line chart expects [{ name: 'Series', series: [{ name, value }] }]
    expect(component.revenueResults.length).toBe(1);
    expect(component.revenueResults[0].name).toBe('Revenue');
    expect(component.revenueResults[0].series.length).toBe(2);
    expect(component.revenueResults[0].series[0].name).toBe('2026-03-01');
    expect(component.revenueResults[0].series[0].value).toBe(500);
  });

  it('should pass orders by status data directly to ngx-charts pie chart', () => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(statsUrl).flush(mockStats);

    // Pie chart receives stats.ordersByStatusChart directly (array of { name, value })
    expect(component.stats!.ordersByStatusChart.length).toBe(3);
    expect(component.stats!.ordersByStatusChart[0].name).toBe('PAID');
    expect(component.stats!.ordersByStatusChart[0].value).toBe(20);
  });

  it('should include top products and low stock products in stats', () => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(statsUrl).flush(mockStats);

    expect(component.stats!.topProducts.length).toBe(2);
    expect(component.stats!.topProducts[0].name).toBe('Gaming Laptop');
    expect(component.stats!.topProducts[0].totalSold).toBe(50);

    expect(component.stats!.lowStockProducts.length).toBe(1);
    expect(component.stats!.lowStockProducts[0].stock).toBe(3);
  });

  it('should set error on API failure', () => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(statsUrl).error(new ProgressEvent('error'));

    expect(component.error).toBeTruthy();
    expect(component.isLoading).toBe(false);
  });

  it('should start in loading state', () => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;

    expect(component.isLoading).toBe(false);

    fixture.detectChanges();

    expect(component.isLoading).toBe(true);

    httpMock.expectOne(statsUrl).flush(mockStats);

    expect(component.isLoading).toBe(false);
  });
});
