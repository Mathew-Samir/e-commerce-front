import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Testimonial } from '../../../../core/interface/testimonial.interface';

@Component({
  selector: 'app-testimonials-card',
  imports: [CommonModule],
  templateUrl: './testimonials-card.html',
  styleUrl: './testimonials-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsCard {
  testimonial = input.required<Testimonial>();
  readonly stars = [1, 2, 3, 4, 5];
}

