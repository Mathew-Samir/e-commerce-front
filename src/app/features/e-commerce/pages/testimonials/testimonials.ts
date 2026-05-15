import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TestimonialService } from '../../../../core/services/testimonial.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TestimonialsCard } from '../testimonials-card/testimonials-card';
import { RouterModule } from '@angular/router';

interface TestimonialForm {
  stars: FormControl<number | null>;
  comment: FormControl<string | null>;
}

@Component({
  selector: 'app-testimonials',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    RatingModule,
    TextareaModule,
    ButtonModule,
    TagModule,
    TestimonialsCard,
    RouterModule,
  ],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Testimonials {
  private readonly testimonialService = inject(TestimonialService);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly approvedTestimonials = toSignal(this.testimonialService.getApprovedTestimonials(), {
    initialValue: [],
  });

  readonly testimonialForm = new FormGroup<TestimonialForm>({
    stars: new FormControl(null, { validators: [Validators.required] }),
    comment: new FormControl('', {
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
    }),
  });

  readonly isSubmitting = signal(false);

  private readonly commentValue = toSignal(this.testimonialForm.controls.comment.valueChanges, {
    initialValue: '',
  });
  readonly commentLength = computed(() => this.commentValue()?.length ?? 0);

  submitTestimonial() {
    if (this.testimonialForm.invalid) {
      this.testimonialForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { comment, stars } = this.testimonialForm.getRawValue();

    if (!comment || !stars) {
      this.isSubmitting.set(false);
      return;
    }

    this.testimonialService.submitTestimonial(comment, stars).subscribe({
      next: (res) => {
        if (res.success) {
          this.testimonialForm.reset();
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Submission failed', err);
        this.isSubmitting.set(false);
      },
    });
  }
}
