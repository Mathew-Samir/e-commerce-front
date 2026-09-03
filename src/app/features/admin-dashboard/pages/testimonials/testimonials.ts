import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialService } from '../../../../core/services/testimonial.service';
import { ApiTestimonial } from '../../../../core/interface/testimonial.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-testimonials-management',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RatingModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestimonialsManagement implements OnInit {
  private testimonialService = inject(TestimonialService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  testimonials = this.testimonialService.testimonials;
  loading = this.testimonialService.isLoading;
  skeletonRows = Array(5).fill({});

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.testimonialService.getAdminTestimonials().subscribe({
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load testimonials' });
      }
    });
  }

  approveTestimonial(testimonial: ApiTestimonial) {
    this.testimonialService.approveAdminTestimonial(testimonial._id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Testimonial approved' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to approve testimonial' });
      }
    });
  }

  rejectTestimonial(testimonial: ApiTestimonial) {
    this.testimonialService.rejectAdminTestimonial(testimonial._id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Testimonial rejected' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reject testimonial' });
      }
    });
  }

  deleteTestimonial(testimonial: ApiTestimonial) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this testimonial?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.testimonialService.deleteAdminTestimonial(testimonial._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Testimonial deleted' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete testimonial' });
          }
        });
      }
    });
  }

  getAuthorName(userId: string | { _id: string; name: string } | null | undefined): string {
    if (typeof userId === 'object' && userId !== null) {
      return (userId as { name: string }).name || 'Anonymous';
    }
    return 'Anonymous';
  }

  getAvatarUrl(userId: string | { _id: string; name: string } | null | undefined): string {
    const author = this.getAuthorName(userId);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random`;
  }
}
