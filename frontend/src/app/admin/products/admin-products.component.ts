import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, ProductResponse } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="animate-fade-in-up">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-heading text-2xl font-bold text-ink-primary">Products</h1>
          <p class="text-sm text-ink-secondary font-body">Manage your store catalog and inventory</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary text-sm shadow-sm">
          <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            class="form-input !pl-10 w-full bg-white shadow-sm ring-1 ring-gray-100">
        </div>
        <div class="flex items-center gap-2">
           <select
            [(ngModel)]="selectedCategory"
            (change)="loadProducts()"
            class="form-input !py-2 text-sm bg-white shadow-sm ring-1 ring-gray-200 min-w-[160px]">
            <option value="">All Categories</option>
            @for (cat of categories; track cat.id) {
              <option [value]="cat.slug">{{ cat.name }}</option>
            }
          </select>
          <select
            [(ngModel)]="selectedStatus"
            (change)="loadProducts()"
            class="form-input !py-2 text-sm bg-white shadow-sm ring-1 ring-gray-200 min-w-[120px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card p-0 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th class="!text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading && products.length === 0) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    <td colspan="6" class="p-0">
                      <div class="h-16 w-full animate-pulse bg-gray-50/50 border-b border-border/50"></div>
                    </td>
                  </tr>
                }
              } @else {
                @for (p of filteredProducts; track p.id) {
                  <tr class="group">
                    <td>
                      <div class="flex items-center gap-3">
                        <img [src]="p.imageUrl || 'assets/placeholder-product.svg'" alt="" class="h-10 w-10 rounded object-contain bg-gray-50 border border-border/50">
                        <div>
                          <span class="block text-sm font-semibold text-ink-primary line-clamp-1">{{ p.name }}</span>
                          <span class="text-xs text-ink-disabled font-mono italic">{{ p.slug }}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="text-xs font-medium text-ink-secondary lowercase bg-gray-100 px-2 py-0.5 rounded">{{ p.category.name }}</span></td>
                    <td><span class="font-mono text-sm font-semibold text-ink-primary">{{ p.price | currency }}</span></td>
                    <td>
                      <span class="text-sm" [class.text-error]="p.stock === 0" [class.font-bold]="p.stock === 0">
                        {{ p.stock }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [class]="p.active ? 'badge-success' : 'badge-neutral'">
                        {{ p.active ? 'Active' : 'Draft' }}
                      </span>
                    </td>
                    <td class="!text-right">
                      <div class="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="openEditModal(p)" class="p-1.5 text-ink-secondary hover:text-primary transition-colors" title="Edit">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button (click)="toggleProduct(p)" class="p-1.5 text-ink-secondary hover:text-warning transition-colors" [title]="p.active ? 'Deactivate' : 'Activate'">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            @if (p.active) {
                              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            } @else {
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            }
                          </svg>
                        </button>
                        <button (click)="deleteProduct(p)" class="p-1.5 text-ink-secondary hover:text-error transition-colors" title="Delete">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @if (filteredProducts.length === 0 && !isLoading) {
                  <tr>
                    <td colspan="6" class="py-12 text-center text-ink-secondary">
                      No products found.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 flex items-center justify-between border-t border-border bg-gray-50/30">
          <p class="text-xs text-ink-secondary font-body">Showing {{ filteredProducts.length }} items</p>
          <div class="flex items-center gap-1">
            <button
              (click)="onPageChange(currentPage - 1)"
              [disabled]="currentPage === 0 || isLoading"
              class="p-2 rounded hover:bg-white disabled:opacity-30 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span class="text-xs font-medium font-body px-3">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <button
              (click)="onPageChange(currentPage + 1)"
              [disabled]="currentPage >= totalPages - 1 || isLoading"
              class="p-2 rounded hover:bg-white disabled:opacity-30 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Product Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-ink-primary/20 backdrop-blur-sm animate-fade-in" (click)="closeModal()"></div>

          <div class="card w-full max-w-lg relative z-10 shadow-dropdown animate-fade-in-up !p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50/50">
              <h3 class="font-heading text-lg font-bold text-ink-primary">{{ editingProduct ? 'Edit Product' : 'Create Product' }}</h3>
              <button (click)="closeModal()" class="text-ink-disabled hover:text-ink-primary transition-colors">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="form-label">Product Name</label>
                  <input type="text" formControlName="name" class="form-input" placeholder="e.g. Sony WH-1000XM5">
                </div>

                <div>
                  <label class="form-label">Slug</label>
                  <input type="text" formControlName="slug" class="form-input" placeholder="sony-wh-1000xm5">
                </div>

                <div>
                  <label class="form-label">Category</label>
                  <select formControlName="categoryId" class="form-input">
                    <option [value]="null" disabled>Select category</option>
                    @for (cat of categories; track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="form-label">Price (USD)</label>
                  <input type="number" formControlName="price" class="form-input font-mono">
                </div>

                <div>
                  <label class="form-label">Stock</label>
                  <input type="number" formControlName="stock" class="form-input font-mono">
                </div>

                <div class="col-span-2">
                  <label class="form-label">Image URL</label>
                  <input type="text" formControlName="imageUrl" class="form-input" placeholder="https://...">
                </div>

                <div class="col-span-2">
                  <label class="form-label">Description</label>
                  <textarea formControlName="description" class="form-input !h-24 resize-none" placeholder="Product features and details..."></textarea>
                </div>

                <div class="col-span-2 flex items-center gap-2">
                  <input type="checkbox" formControlName="active" id="activeToggle" class="accent-primary h-4 w-4">
                  <label for="activeToggle" class="text-sm font-body text-ink-primary">Active and visible in store</label>
                </div>
              </div>

              @if (errorMessage) {
                <p class="text-xs text-error font-medium bg-error-bg/50 p-2 rounded border border-error/10">{{ errorMessage }}</p>
              }

              <div class="pt-4 flex items-center justify-end gap-3">
                <button type="button" (click)="closeModal()" class="btn-secondary !px-6" [disabled]="isSubmitting">Cancel</button>
                <button type="submit" class="btn-primary !px-8 shadow-sm" [disabled]="productForm.invalid || isSubmitting">
                  @if (isSubmitting) {
                    <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  } @else {
                    {{ editingProduct ? 'Update Product' : 'Create Product' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private adminService = inject(AdminService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Pagination & Filters
  currentPage = 0;
  totalPages = 0;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';

  // Modal & Form
  showModal = false;
  editingProduct: Product | null = null;
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      categoryId: [null, Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(cats => {
      this.categories = cats;
      this.cdr.markForCheck();
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.adminService.getAdminProducts(this.currentPage, 10)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })).subscribe(page => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.cdr.markForCheck();
      });
  }

  get filteredProducts(): Product[] {
    let filtered = this.products;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category?.slug === this.selectedCategory);
    }

    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(p => p.active);
    } else if (this.selectedStatus === 'inactive') {
      filtered = filtered.filter(p => !p.active);
    }

    return filtered;
  }

  onSearch() {
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  openCreateModal() {
    this.editingProduct = null;
    this.productForm.reset({ active: true, price: 0, stock: 0 });
    this.showModal = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      categoryId: product.category.id,
      active: product.active
    });
    this.showModal = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const request = this.productForm.value;
    const obs = this.editingProduct
      ? this.adminService.updateProduct(this.editingProduct.id, request)
      : this.adminService.createProduct(request);

    obs.pipe(finalize(() => {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => {
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error saving product. Please verify unique slug.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleProduct(product: Product) {
    this.adminService.toggleProduct(product.id).subscribe({
      next: (updated) => {
        product.active = updated.active;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to toggle product:', err);
      }
    });
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.adminService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => {
          alert(err.error?.message || 'Cannot delete this product. It may have existing orders.');
        }
      });
    }
  }
}
