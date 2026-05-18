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
import { CollectionService } from '../../../../core/services/collection.service';

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
  private readonly collectionService = inject(CollectionService);

  bestSellers = this.productService.bestSellers;
  seasonalProducts = this.collectionService.seasonalProducts;
  activeCollections = this.collectionService.activeCollections;
  testimonials = toSignal(this.testimonialService.getApprovedTestimonials(), { initialValue: [] });

  constructor() {
    this.productService.getBestSellers().subscribe();
    this.collectionService.getSeasonalProducts(10).subscribe();
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

  getSeverity(stock: number): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  getStockStatus(stock: number): string {
    if (stock > 10) return 'INSTOCK';
    if (stock > 0) return 'LOWSTOCK';
    return 'OUTOFSTOCK';
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
