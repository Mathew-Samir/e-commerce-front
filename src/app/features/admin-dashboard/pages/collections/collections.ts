import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CollectionService } from '../../../../core/services/collection.service';
import { Collection } from '../../../../core/interface/collection.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-collections-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    DatePickerModule,
    ToggleSwitchModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './collections.html',
  styleUrl: './collections.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsManagement implements OnInit {
  private collectionService = inject(CollectionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  collections = this.collectionService.collections;
  loading = this.collectionService.isLoading;

  collectionDialog = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedCollection = signal<Collection | null>(null);

  collectionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    isActive: [true],
    bannerImage: [''],
  });

  skeletonRows = Array(5).fill({});

  ngOnInit() {
    this.collectionService.getCollections().subscribe();
  }

  openNew() {
    this.selectedCollection.set(null);
    this.isEdit.set(false);
    this.collectionForm.reset({ isActive: true });
    this.collectionDialog.set(true);
  }

  editCollection(collection: Collection) {
    this.selectedCollection.set(collection);
    this.isEdit.set(true);
    this.collectionForm.patchValue({
      name: collection.name,
      title: collection.title,
      startDate: new Date(collection.startDate),
      endDate: new Date(collection.endDate),
      isActive: collection.isActive,
      bannerImage: collection.bannerImage || '',
    });
    this.collectionDialog.set(true);
  }

  saveCollection() {
    if (this.collectionForm.invalid) {
      this.collectionForm.markAllAsTouched();
      return;
    }

    const formValue = this.collectionForm.value;

    if (formValue.endDate <= formValue.startDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'End date must be after start date',
      });
      return;
    }

    const payload = {
      name: formValue.name,
      title: formValue.title,
      startDate: formValue.startDate.toISOString(),
      endDate: formValue.endDate.toISOString(),
      isActive: formValue.isActive,
      bannerImage: formValue.bannerImage || undefined,
    };

    const action = this.isEdit()
      ? this.collectionService.updateCollection(this.selectedCollection()!._id, payload)
      : this.collectionService.createCollection(payload);

    action.subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Collection ${this.isEdit() ? 'updated' : 'created'} successfully`,
          });
          this.collectionDialog.set(false);
        }
      },
    });
  }

  deleteCollection(collection: Collection) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${collection.title}"? Products in this collection will be unlinked.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.collectionService.deleteCollection(collection._id).subscribe({
          next: (res) => {
            if (res) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Collection deleted successfully',
              });
            }
          },
        });
      },
    });
  }

  toggleActive(collection: Collection) {
    this.collectionService.toggleCollectionActive(collection._id).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Collection ${collection.isActive ? 'deactivated' : 'activated'}`,
          });
        }
      },
    });
  }

  hideDialog() {
    this.collectionDialog.set(false);
  }

  isCurrentlyActive(collection: Collection): boolean {
    if (!collection.isActive) return false;
    const now = new Date();
    return new Date(collection.startDate) <= now && new Date(collection.endDate) >= now;
  }

  getStatusLabel(collection: Collection): string {
    if (!collection.isActive) return 'Disabled';
    const now = new Date();
    if (new Date(collection.startDate) > now) return 'Scheduled';
    if (new Date(collection.endDate) < now) return 'Expired';
    return 'Live';
  }

  getStatusClass(collection: Collection): string {
    const label = this.getStatusLabel(collection);
    switch (label) {
      case 'Live': return 'live';
      case 'Scheduled': return 'scheduled';
      case 'Expired': return 'expired';
      default: return 'disabled';
    }
  }
}
