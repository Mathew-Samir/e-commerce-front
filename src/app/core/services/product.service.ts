import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, ProductCategory, ProductSubCategory } from '../interface/product.interface';
import { ApiResponse } from '../interface/api-response.interface';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  // State
  private productsSignal = signal<Product[]>([]);
  private selectedProductSignal = signal<Product | null>(null);
  private relatedProductsSignal = signal<Product[]>([]);

  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private categoriesSignal = signal<ProductCategory[]>([]);
  private subCategoriesSignal = signal<ProductSubCategory[]>([]);

  // Selectors
  products = computed(() => this.productsSignal());
  selectedProduct = computed(() => this.selectedProductSignal());
  relatedProducts = computed(() => this.relatedProductsSignal());
  categories = computed(() => this.categoriesSignal());
  subCategories = computed(() => this.subCategoriesSignal());
  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  getProducts(filters?: { category?: string; subcategory?: string }) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.subcategory) params = params.set('subcategory', filters.subcategory);

    return this.http.get<ApiResponse<Product[]>>(this.apiUrl, { params }).pipe(
      tap((res) => {
        if (res.success) {
          this.productsSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch products');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getCategories() {
    return this.http.get<ApiResponse<ProductCategory[]>>(`${environment.apiUrl}/admin/categories`).pipe(
      tap((res) => {
        if (res.success) {
          this.categoriesSignal.set(res.data);
        }
      }),
    );
  }

  getSubCategories() {
    return this.http.get<ApiResponse<ProductSubCategory[]>>(`${environment.apiUrl}/admin/subcategories`).pipe(
      tap((res) => {
        if (res.success) {
          this.subCategoriesSignal.set(res.data);
        }
      }),
    );
  }

  createCategory(categoryData: any) {
    this.loadingSignal.set(true);
    return this.http.post<ApiResponse<ProductCategory>>(`${environment.apiUrl}/admin/categories`, categoryData).pipe(
      tap((res) => {
        if (res.success) {
          this.categoriesSignal.update((cats) => [res.data, ...cats]);
        }
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  updateCategory(id: string, categoryData: any) {
    this.loadingSignal.set(true);
    return this.http.put<ApiResponse<ProductCategory>>(`${environment.apiUrl}/admin/categories/${id}`, categoryData).pipe(
      tap((res) => {
        if (res.success) {
          this.categoriesSignal.update((cats) =>
            cats.map((c) => (c._id === id ? res.data : c)),
          );
        }
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  deleteCategory(id: string) {
    this.loadingSignal.set(true);
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/admin/categories/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.categoriesSignal.update((cats) => cats.filter((c) => c._id !== id));
        }
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  toggleCategoryActive(id: string) {
    return this.http.patch<ApiResponse<ProductCategory>>(`${environment.apiUrl}/admin/categories/${id}/toggle-active`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.categoriesSignal.update((cats) =>
            cats.map((c) => (c._id === id ? res.data : c)),
          );
        }
      }),
    );
  }

  createSubcategory(subcategoryData: any) {
    this.loadingSignal.set(true);
    return this.http.post<ApiResponse<ProductSubCategory>>(`${environment.apiUrl}/admin/subcategories`, subcategoryData).pipe(
      tap((res) => {
        if (res.success) {
          this.subCategoriesSignal.update((subs) => [res.data, ...subs]);
        }
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  updateSubcategory(id: string, subcategoryData: any) {
    this.loadingSignal.set(true);
    return this.http.put<ApiResponse<ProductSubCategory>>(`${environment.apiUrl}/admin/subcategories/${id}`, subcategoryData).pipe(
      tap((res) => {
        if (res.success) {
          this.subCategoriesSignal.update((subs) =>
            subs.map((s) => (s._id === id ? res.data : s)),
          );
        }
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  deleteSubcategory(id: string) {
    this.loadingSignal.set(true);
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/admin/subcategories/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.subCategoriesSignal.update((subs) => subs.filter((s) => s._id !== id));
        }
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  toggleSubcategoryActive(id: string) {
    return this.http.patch<ApiResponse<ProductSubCategory>>(`${environment.apiUrl}/admin/subcategories/${id}/toggle-active`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.subCategoriesSignal.update((subs) =>
            subs.map((s) => (s._id === id ? res.data : s)),
          );
        }
      }),
    );
  }

  getProductById(id: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.selectedProductSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch product details');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getRelatedProducts(id: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/${id}/related`).pipe(
      tap((res) => {
        if (res.success) {
          this.relatedProductsSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch related products');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  createProduct(productData: FormData) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.post<ApiResponse<Product>>(this.apiUrl, productData).pipe(
      tap((res) => {
        if (res.success) {
          this.productsSignal.update((products) => [res.data, ...products]);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to create product');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  updateProduct(id: string, productData: FormData) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, productData).pipe(
      tap((res) => {
        if (res.success) {
          this.productsSignal.update((products) =>
            products.map((p) => (p._id === id ? res.data : p)),
          );
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to update product');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  deleteProduct(id: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.productsSignal.update((products) => products.filter((p) => p._id !== id));
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to delete product');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  toggleProductActive(id: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.patch<ApiResponse<Product>>(`${this.apiUrl}/${id}/toggle-active`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.productsSignal.update((products) =>
            products.map((p) => (p._id === id ? res.data : p)),
          );
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to toggle product status');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }
}
