import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return true for isAuthenticated with valid non-expired token', () => {
    // Create a fake JWT with exp in the future
    const payload = { sub: 'test@example.com', name: 'Test', role: 'CUSTOMER', exp: Math.floor(Date.now() / 1000) + 3600 };
    const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
    localStorage.setItem('accessToken', fakeToken);

    // Re-create service to pick up token
    service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false for isAuthenticated with expired token', () => {
    const payload = { sub: 'test@example.com', name: 'Test', role: 'CUSTOMER', exp: Math.floor(Date.now() / 1000) - 3600 };
    const fakeToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
    localStorage.setItem('accessToken', fakeToken);

    service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should clear localStorage on logout', () => {
    localStorage.setItem('accessToken', 'some-token');
    localStorage.setItem('refreshToken', 'some-refresh');

    service.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
