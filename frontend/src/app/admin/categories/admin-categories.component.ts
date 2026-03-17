import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in-up">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-heading text-2xl font-bold text-ink-primary">Categories</h1>
          <p class="text-sm text-ink-secondary font-body">Organize your products into logical groups</p>
        </div>
        <button (click)="openCreateModal()" class="btn-primary text-sm shadow-sm">
          <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
      </div>

      <!-- Table Card -->
      <div class="card p-0 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th class="!text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading && categories.length === 0) {
                @for (i of [1,2,3]; track i) {
                  <tr>
                    <td colspan="4" class="p-0">
                      <div class="h-16 w-full animate-pulse bg-gray-50/50 border-b border-border/50"></div>
                    </td>
                  </tr>
                }
              } @else {
                @for (cat of categories; track cat.id) {
                  <tr class="group">
                    <td>
                      <div class="flex items-center gap-3">
                        <img [src]="cat.imageUrl || 'assets/placeholder-product.svg'" alt="" class="h-8 w-8 rounded object-contain bg-gray-50 border border-border/50">
                        <span class="text-sm font-semibold text-ink-primary">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="text-xs font-mono text-ink-disabled lowercase">{{ cat.slug }}</span>
                    </td>
                    <td>
                      <p class="text-sm text-ink-secondary line-clamp-1 max-w-xs">{{ cat.description || 'No description' }}</p>
                    </td>
                    <td class="!text-right">
                      <div class="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="openEditModal(cat)" class="p-1.5 text-ink-secondary hover:text-primary transition-colors">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button (click)="deleteCategory(cat)" class="p-1.5 text-ink-secondary hover:text-error transition-colors">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Category Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-ink-primary/20 backdrop-blur-sm animate-fade-in" (click)="closeModal()"></div>
          
          <div class="card w-full max-w-md relative z-10 shadow-dropdown animate-fade-in-up !p-0 overflow-hidden">
            <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50/50">
              <h3 class="font-heading text-lg font-bold text-ink-primary">{{ editingCategory ? 'Edit Category' : 'Create Category' }}</h3>
              <button (click)="closeModal()" class="text-ink-disabled hover:text-ink-primary transition-colors">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
              <div>
                <label class="form-label">Category Name</label>
                <input type="text" formControlName="name" class="form-input" placeholder="e.g. Headphones">
              </div>
              
              <div>
                <label class="form-label">Slug</label>
                <input type="text" formControlName="slug" class="form-input" placeholder="headphones">
              </div>

              <div>
                <label class="form-label">Image URL</label>
                <input type="text" formControlName="imageUrl" class="form-input" placeholder="https://...">
              </div>

              <div>
                <label class="form-label">Description</label>
                <textarea formControlName="description" class="form-input !h-24 resize-none" placeholder="Brief description of the category..."></textarea>
              </div>

              @if (errorMessage) {
                <p class="text-xs text-error font-medium bg-error-bg/50 p-2 rounded border border-error/10">{{ errorMessage }}</p>
              }

              <div class="pt-4 flex items-center justify-end gap-3">
                <button type="button" (click)="closeModal()" class="btn-secondary !px-6" [disabled]="isSubmitting">Cancel</button>
                <button type="submit" class="btn-primary !px-8 shadow-sm" [disabled]="categoryForm.invalid || isSubmitting">
                  @if (isSubmitting) {
                    <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  } @else {
                    {{ editingCategory ? 'Update Category' : 'Create Category' }}
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
export class AdminCategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // Modal & Form
  showModal = false;
  editingCategory: Category | null = null;
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      imageUrl: [''],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.categoryService.getAllCategories()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe(cats => {
        this.categories = cats;
        this.cdr.markForCheck();
      });
  }

  openCreateModal() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showModal = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  openEditModal(category: Category) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      description: category.description
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
    if (this.categoryForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const request = this.categoryForm.value;
    const obs = this.editingCategory 
      ? this.adminService.updateCategory(this.editingCategory.id, request)
      : this.adminService.createCategory(request);

    obs.pipe(finalize(() => {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: () => {
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error saving category. verify unique slug.';
        this.cdr.markForCheck();
      }
    });
  }

  deleteCategory(category: Category) {
    if (confirm(`Are you sure you want to delete "${category.name}"? This might affect products using this category.`)) {
      this.adminService.deleteCategory(category.id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
