import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TestimonialsCard } from '../testimonials-card/testimonials-card';
import { Testimonial } from '../../../../core/interface/testimonial.interface';
import { TestimonialService } from '../../../../core/services/testimonial.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/interface/product.interface';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselModule, ButtonModule, TagModule, TestimonialsCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly testimonialService = inject(TestimonialService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  products = this.productService.products;
  testimonials = toSignal(this.testimonialService.getApprovedTestimonials(), { initialValue: [] });

  constructor() {
    this.productService.getProducts().subscribe();
  }


  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'info';
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
