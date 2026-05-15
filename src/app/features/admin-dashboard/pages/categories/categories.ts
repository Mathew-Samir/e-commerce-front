import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { ProductCategory, ProductSubCategory } from '../../../../core/interface/product.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TagModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesManagement implements OnInit {
  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  categories = this.productService.categories;
  subCategories = this.productService.subCategories;
  loading = this.productService.isLoading;

  categoryDialog = signal<boolean>(false);
  subcategoryDialog = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  
  selectedCategory = signal<ProductCategory | null>(null);
  selectedSubcategory = signal<ProductSubCategory | null>(null);

  categoryForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  subcategoryForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    categoryId: ['', Validators.required],
  });

  skeletonRows = Array(5).fill({});

  ngOnInit() {
    this.productService.getCategories().subscribe();
    this.productService.getSubCategories().subscribe();
  }

  // Category Actions
  openNewCategory() {
    this.selectedCategory.set(null);
    this.isEdit.set(false);
    this.categoryForm.reset();
    this.categoryDialog.set(true);
  }

  editCategory(category: ProductCategory) {
    this.selectedCategory.set(category);
    this.isEdit.set(true);
    this.categoryForm.patchValue({
      title: category.title,
      description: category.description,
    });
    this.categoryDialog.set(true);
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    const data = this.categoryForm.value;
    const action = this.isEdit() 
      ? this.productService.updateCategory(this.selectedCategory()!._id, data)
      : this.productService.createCategory(data);

    action.subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Category ${this.isEdit() ? 'updated' : 'created'} successfully`,
          });
          this.categoryDialog.set(false);
        }
      },
    });
  }

  deleteCategory(category: ProductCategory) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${category.title}? This will also affect related subcategories and products.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      accept: () => {
        this.productService.deleteCategory(category._id).subscribe({
          next: (res) => {
            if (res) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Category deleted successfully',
              });
            }
          },
        });
      },
    });
  }

  toggleCategoryActive(category: ProductCategory) {
    this.productService.toggleCategoryActive(category._id).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category status updated',
          });
        }
      },
    });
  }

  // Subcategory Actions
  openNewSubcategory() {
    this.selectedSubcategory.set(null);
    this.isEdit.set(false);
    this.subcategoryForm.reset();
    this.subcategoryDialog.set(true);
  }

  editSubcategory(sub: ProductSubCategory) {
    this.selectedSubcategory.set(sub);
    this.isEdit.set(true);
    this.subcategoryForm.patchValue({
      title: sub.title,
      categoryId: typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId,
    });
    this.subcategoryDialog.set(true);
  }

  saveSubcategory() {
    if (this.subcategoryForm.invalid) return;

    const data = this.subcategoryForm.value;
    const action = this.isEdit() 
      ? this.productService.updateSubcategory(this.selectedSubcategory()!._id, data)
      : this.productService.createSubcategory(data);

    action.subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Subcategory ${this.isEdit() ? 'updated' : 'created'} successfully`,
          });
          this.subcategoryDialog.set(false);
        }
      },
    });
  }

  deleteSubcategory(sub: ProductSubCategory) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${sub.title}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      accept: () => {
        this.productService.deleteSubcategory(sub._id).subscribe({
          next: (res) => {
            if (res) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Subcategory deleted successfully',
              });
            }
          },
        });
      },
    });
  }

  toggleSubcategoryActive(sub: ProductSubCategory) {
    this.productService.toggleSubcategoryActive(sub._id).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Subcategory status updated',
          });
        }
      },
    });
  }

  getCategoryName(categoryId: any): string {
    if (typeof categoryId === 'object' && categoryId.title) return categoryId.title;
    const cat = this.categories().find(c => c._id === categoryId);
    return cat ? cat.title : 'Unknown';
  }
}
