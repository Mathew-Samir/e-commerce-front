import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiTestimonial, SingleTestimonialResponse, Testimonial, TestimonialsResponse, TestimonialFilters } from '../interface/testimonial.interface';
import { map, tap, catchError, of, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/testimonials`;

  // State
  private testimonialsSignal = signal<ApiTestimonial[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private countSignal = signal<number>(0);

  // Selectors
  testimonials = computed(() => this.testimonialsSignal());
  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  count = computed(() => this.countSignal());

  // Public Methods
  submitTestimonial(comment: string, stars: number) {
    return this.http.post<SingleTestimonialResponse>(
      this.apiUrl,
      { comment, stars }
    );
  }

  getApprovedTestimonials() {
    return this.http.get<TestimonialsResponse>(this.apiUrl).pipe(
      map(res => {
        if (!res.success) return [];
        return res.data.map(apiTestimonial => {
           const authorName = typeof apiTestimonial.userId === 'object' && apiTestimonial.userId.name
                ? apiTestimonial.userId.name
                : 'Anonymous';

           return {
             id: apiTestimonial._id,
             name: authorName,
             avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`,
             content: apiTestimonial.comment,
             rating: apiTestimonial.stars,
             date: apiTestimonial.createdAt ? new Date(apiTestimonial.createdAt).toLocaleDateString() : undefined
           } as Testimonial;
        });
      })
    );
  }

  getMyTestimonial() {
    return this.http.get<SingleTestimonialResponse>(`${this.apiUrl}/my`);
  }

  markAsViewed(id: string) {
    return this.http.patch<SingleTestimonialResponse>(`${this.apiUrl}/${id}/view`, {});
  }

  // Admin Methods
  getAdminTestimonials(filters?: TestimonialFilters) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.stars) params = params.set('stars', filters.stars.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    // Using exact path from user's list: GET /testimonials/admin
    return this.http.get<TestimonialsResponse>(`${this.apiUrl}/admin`, { params }).pipe(
      tap(res => {
        if (res.success) {
          this.testimonialsSignal.set(res.data);
          this.countSignal.set(res.count);
        }
      }),
      catchError(err => {
        this.errorSignal.set(err.error?.message || 'Failed to fetch testimonials');
        return of(null);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  getAdminTestimonialById(id: string) {
    // Using exact path from user's list: GET /testimonials/admin/:id
    return this.http.get<SingleTestimonialResponse>(`${this.apiUrl}/admin/${id}`);
  }

  approveAdminTestimonial(id: string) {
    this.loadingSignal.set(true);
    // Using exact path from user's list: PATCH /testimonials/admin/:id/approve
    return this.http.patch<SingleTestimonialResponse>(`${this.apiUrl}/admin/${id}/approve`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.testimonialsSignal.update(list =>
            list.map(t => t._id === id ? res.data : t)
          );
        }
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  rejectAdminTestimonial(id: string) {
    this.loadingSignal.set(true);
    // Using exact path from user's list: PATCH /testimonials/admin/:id/reject
    return this.http.patch<SingleTestimonialResponse>(`${this.apiUrl}/admin/${id}/reject`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.testimonialsSignal.update(list =>
            list.map(t => t._id === id ? res.data : t)
          );
        }
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  deleteAdminTestimonial(id: string) {
    this.loadingSignal.set(true);
    // Using exact path from user's list: DELETE /testimonials/admin/:id
    return this.http.delete<SingleTestimonialResponse>(`${this.apiUrl}/admin/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this.testimonialsSignal.update(list => list.filter(t => t._id !== id));
          this.countSignal.update(c => c - 1);
        }
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }
}
