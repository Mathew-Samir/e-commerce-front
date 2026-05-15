import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { AvatarModule } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { Testimonial } from '../../../../core/interface/testimonial.interface';

@Component({
  selector: 'app-testimonials-card',
  imports: [CommonModule, CardModule, RatingModule, AvatarModule, FormsModule],
  templateUrl: './testimonials-card.html',
  styleUrl: './testimonials-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsCard {
  testimonial = input.required<Testimonial>();
}

