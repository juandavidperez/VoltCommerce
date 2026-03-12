import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex bg-surface-app">
      <!-- Left Panel — Branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-ink-primary items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03]"
             style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 35px, #FFEA00 35px, #FFEA00 36px);">
        </div>
        <div class="relative z-10 text-center px-12 animate-fade-in-up">
          <img src="assets/logo-icon.svg" alt="" class="h-20 w-auto mx-auto mb-8 drop-shadow-lg">
          <h1 class="font-heading text-4xl font-bold text-white mb-3">
            Join <span class="text-primary">Volt</span>Commerce
          </h1>
          <p class="text-lg text-white/50 font-body max-w-sm mx-auto">
            Create your account and start shopping the best electronics deals.
          </p>
        </div>
      </div>

      <!-- Right Panel — Form -->
      <div class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md animate-fade-in-up">
          <!-- Mobile Logo -->
          <div class="lg:hidden flex items-center justify-center gap-2 mb-10">
            <img src="assets/logo-icon.svg" alt="" class="h-10 w-auto">
            <span class="font-heading font-bold text-2xl text-ink-primary">
              <span class="text-primary">Volt</span>Commerce
            </span>
          </div>

          <h2 class="font-heading text-2xl font-bold text-ink-primary mb-1">Create account</h2>
          <p class="text-sm text-ink-secondary font-body mb-8">Start shopping for electronics</p>

          @if (errorMessage) {
            <div class="flex items-center gap-2 bg-danger-bg text-danger px-4 py-3 rounded-md mb-6 text-sm font-body">
              <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ errorMessage }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-5">
              <label for="name" class="form-label">Full Name</label>
              <input id="name" type="text" formControlName="name"
                class="form-input" placeholder="John Doe">
            </div>

            <div class="mb-5">
              <label for="email" class="form-label">Email Address</label>
              <input id="email" type="email" formControlName="email"
                class="form-input" placeholder="you&#64;example.com">
            </div>

            <div class="mb-5">
              <label for="password" class="form-label">Password</label>
              <input id="password" type="password" formControlName="password"
                class="form-input" placeholder="Min. 6 characters">
            </div>

            <div class="mb-6">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input id="confirmPassword" type="password" formControlName="confirmPassword"
                class="form-input" placeholder="Re-enter password">
              @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
                <p class="form-error">Passwords do not match</p>
              }
            </div>

            <button type="submit" [disabled]="form.invalid || loading"
              class="btn-primary w-full text-sm">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="text-center text-sm text-ink-secondary mt-8 font-body">
            Already have an account?
            <a routerLink="/auth/login" class="text-primary hover:text-primary-hover font-medium transition-colors">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { name, email, password } = this.form.value;
    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
