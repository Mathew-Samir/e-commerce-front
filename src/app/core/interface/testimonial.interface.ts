export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  content: string;
  rating: number;
  date?: string;
}

export interface ApiTestimonial {
  _id: string;
  userId: string | { _id: string; name: string };
  comment: string;
  stars: number;
  status: string;
  isApproved: boolean;
  isUserViewed?: boolean;
  createdAt?: string;
}

export interface TestimonialsResponse {
  success: boolean;
  count: number;
  data: ApiTestimonial[];
}

export interface SingleTestimonialResponse {
  success: boolean;
  data: ApiTestimonial;
}

export interface TestimonialFilters {
  status?: 'pending' | 'approved' | 'rejected';
  stars?: number;
  search?: string;
  page?: number;
  limit?: number;
}
