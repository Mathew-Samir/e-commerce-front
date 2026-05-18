import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Collection, CreateCollectionPayload } from '../interface/collection.interface';
import { Product } from '../interface/product.interface';
import { ApiResponse } from '../interface/api-response.interface';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, finalize } from 'rxjs';

interface SeasonalProductsResponse {
  success: boolean;
  count: number;
  data: Product[];
  collections: Collection[];
}

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private http = inject(HttpClient);
  private adminUrl = `${environment.apiUrl}/admin/collections`;
  private publicUrl = `${environment.apiUrl}/collections`;

  // State
  private collectionsSignal = signal<Collection[]>([]);
  private activeCollectionsSignal = signal<Collection[]>([]);
  private seasonalProductsSignal = signal<Product[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Selectors
  collections = computed(() => this.collectionsSignal());
  activeCollections = computed(() => this.activeCollectionsSignal());
  seasonalProducts = computed(() => this.seasonalProductsSignal());
  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  // ── Admin Methods ──

  getCollections() {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.get<ApiResponse<Collection[]>>(this.adminUrl).pipe(
      tap((res) => {
        if (res.success) {
          this.collectionsSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch collections');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  createCollection(data: CreateCollectionPayload) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.post<ApiResponse<Collection>>(this.adminUrl, data).pipe(
      tap((res) => {
        if (res.success) {
          this.collectionsSignal.update((cols) => [res.data, ...cols]);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to create collection');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  updateCollection(id: string, data: Partial<CreateCollectionPayload>) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.put<ApiResponse<Collection>>(`${this.adminUrl}/${id}`, data).pipe(
      tap((res) => {
        if (res.success) {
          this.collectionsSignal.update((cols) =>
            cols.map((c) => (c._id === id ? res.data : c)),
          );
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to update collection');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  deleteCollection(id: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http.delete<ApiResponse<null>>(`${this.adminUrl}/${id}`).pipe(
      tap((res) => {
        if (res.success) {
          this.collectionsSignal.update((cols) => cols.filter((c) => c._id !== id));
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to delete collection');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  toggleCollectionActive(id: string) {
    return this.http
      .patch<ApiResponse<Collection>>(`${this.adminUrl}/${id}/toggle-active`, {})
      .pipe(
        tap((res) => {
          if (res.success) {
            this.collectionsSignal.update((cols) =>
              cols.map((c) => (c._id === id ? res.data : c)),
            );
          }
        }),
        catchError((err) => {
          this.errorSignal.set(err.error?.message || 'Failed to toggle collection status');
          return of(null);
        }),
      );
  }

  // ── Public Methods ──

  getActiveCollections() {
    return this.http.get<ApiResponse<Collection[]>>(`${this.publicUrl}/active`).pipe(
      tap((res) => {
        if (res.success) {
          this.activeCollectionsSignal.set(res.data);
        }
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch active collections');
        return of(null);
      }),
    );
  }

  getSeasonalProducts(limit: number = 20) {
    return this.http
      .get<SeasonalProductsResponse>(`${this.publicUrl}/seasonal-products`, {
        params: { limit: limit.toString() },
      })
      .pipe(
        tap((res) => {
          if (res.success) {
            this.seasonalProductsSignal.set(res.data);
            this.activeCollectionsSignal.set(res.collections || []);
          }
        }),
        catchError((err) => {
          this.errorSignal.set(err.error?.message || 'Failed to fetch seasonal products');
          return of(null);
        }),
      );
  }
}
