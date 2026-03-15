import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService, ProductFilters } from './product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send default page and size when no filters are provided', () => {
    service.getProducts().subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('12');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should include category param when filtering by category', () => {
    const filters: ProductFilters = { category: 'laptops' };
    service.getProducts(filters).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('category')).toBe('laptops');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should include price range params when filtering by price', () => {
    const filters: ProductFilters = { minPrice: 100, maxPrice: 500 };
    service.getProducts(filters).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('minPrice')).toBe('100');
    expect(req.request.params.get('maxPrice')).toBe('500');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should include search param when searching', () => {
    const filters: ProductFilters = { search: 'laptop' };
    service.getProducts(filters).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('search')).toBe('laptop');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should include sort params when sorting', () => {
    const filters: ProductFilters = { sortBy: 'price', sortDir: 'asc' };
    service.getProducts(filters).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('sortBy')).toBe('price');
    expect(req.request.params.get('sortDir')).toBe('asc');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should build all query params correctly when all filters are provided', () => {
    const filters: ProductFilters = {
      category: 'electronica',
      minPrice: 100,
      maxPrice: 500,
      search: 'laptop',
      sortBy: 'price',
      sortDir: 'asc',
      page: 2,
      size: 24
    };
    service.getProducts(filters).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('category')).toBe('electronica');
    expect(req.request.params.get('minPrice')).toBe('100');
    expect(req.request.params.get('maxPrice')).toBe('500');
    expect(req.request.params.get('search')).toBe('laptop');
    expect(req.request.params.get('sortBy')).toBe('price');
    expect(req.request.params.get('sortDir')).toBe('asc');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('24');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should not include optional params when they are undefined', () => {
    const filters: ProductFilters = { page: 1 };
    service.getProducts(filters).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.has('category')).toBe(false);
    expect(req.request.params.has('minPrice')).toBe(false);
    expect(req.request.params.has('maxPrice')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('sortBy')).toBe(false);
    expect(req.request.params.has('sortDir')).toBe(false);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('12');
    req.flush({ content: [], totalElements: 0, totalPages: 0 });
  });

  it('should call the correct URL for getProductBySlug', () => {
    service.getProductBySlug('gaming-laptop').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/gaming-laptop`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
