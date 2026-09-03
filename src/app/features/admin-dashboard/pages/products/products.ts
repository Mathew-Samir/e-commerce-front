import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { Product } from '../../../../core/interface/product.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-products-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    SkeletonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsManagement implements OnInit {
  private productService = inject(ProductService);
  private collectionService = inject(CollectionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  products = this.productService.products;
  categories = this.productService.categories;
  subCategories = this.productService.subCategories;
  collections = this.collectionService.collections;
  loading = this.productService.isLoading;
  readonly placeholderImage = signal('assets/placeholder.png');

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: [''],
    subCategoryId: [''],
    collectionId: [''],
  });

  filterForm: FormGroup = this.fb.group({
    categoryId: [''],
    subCategoryId: [''],
  });

  selectedCategoryId = toSignal(this.productForm.get('categoryId')!.valueChanges, {
    initialValue: '',
  });

  selectedFilterCategoryId = toSignal(this.filterForm.get('categoryId')!.valueChanges, {
    initialValue: '',
  });

  filteredSubCategories = computed(() => {
    const categoryId = this.selectedCategoryId();
    if (!categoryId) return [];
    return this.subCategories().filter((sub) => {
      const subCatId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
      return subCatId === categoryId;
    });
  });

  filterSubCategories = computed(() => {
    const categoryId = this.selectedFilterCategoryId();
    if (!categoryId) return [];
    return this.subCategories().filter((sub) => {
      const subCatId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
      return subCatId === categoryId;
    });
  });

  productDialog = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedProduct = signal<Product | null>(null);
  selectedFile = signal<File | null>(null);

  skeletonRows = Array(5).fill({});

  ngOnInit() {
    this.loadProducts();
    this.productService.getCategories().subscribe();
    this.productService.getSubCategories().subscribe();
    this.collectionService.getCollections().subscribe();
  }

  loadProducts() {
    const filters = {
      category: this.filterForm.get('categoryId')?.value,
      subcategory: this.filterForm.get('subCategoryId')?.value,
    };
    this.productService.getProducts(filters).subscribe();
  }

  onFilterChange() {
    this.loadProducts();
  }

  onFilterCategoryChange() {
    this.filterForm.patchValue({ subCategoryId: '' });
    this.loadProducts();
  }

  clearFilters() {
    this.filterForm.reset({ categoryId: '', subCategoryId: '' });
    this.loadProducts();
  }

  openNew() {
    this.selectedProduct.set(null);
    this.isEdit.set(false);
    this.selectedFile.set(null);
    this.productForm.reset({ price: 0, stock: 0 });
    this.productDialog.set(true);
  }

  editProduct(product: Product) {
    this.selectedProduct.set(product);
    this.isEdit.set(true);
    this.selectedFile.set(null);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId?._id || '',
      subCategoryId: product.subCategoryId?._id || '',
      collectionId: product.collectionId?._id || '',
    });

    this.productDialog.set(true);
  }

  onCategoryChange(categoryId: string) {
    this.productForm.patchValue({ subCategoryId: '' });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${product.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.productService.deleteProduct(product._id).subscribe({
          next: (res) => {
            if (res) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Product deleted successfully',
              });
            }
          },
        });
      },
    });
  }

  toggleActive(product: Product) {
    this.productService.toggleProductActive(product._id).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product status updated',
          });
        }
      },
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  hideDialog() {
    this.productDialog.set(false);
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields correctly',
      });
      return;
    }

    const formData = new FormData();
    const values = this.productForm.value;

    Object.keys(values).forEach((key) => {
      if (values[key] !== null && values[key] !== '') {
        formData.append(key, values[key]);
      }
    });

    const file = this.selectedFile();
    if (file) {
      formData.append('image', file);
    } else if (!this.isEdit()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Image is required for new product',
      });
      return;
    }

    if (this.isEdit()) {
      const product = this.selectedProduct();
      if (product) {
        this.productService.updateProduct(product._id, formData).subscribe({
          next: (res) => {
            if (res) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Product updated successfully',
              });
              this.hideDialog();
            }
          },
        });
      }
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (res) => {
          if (res) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product created successfully',
            });
            this.hideDialog();
          }
        },
      });
    }
  }
}
