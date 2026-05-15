import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ProjectService } from '../../../../../core/services/project.service';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule
  ],
  template: `
    <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-3 p-2">
      <div class="flex flex-column gap-2">
        <label for="title" class="font-bold text-900">Title</label>
        <input pInputText id="title" formControlName="title" placeholder="Enter project title" class="w-full" />
        @if (projectForm.get('title')?.touched && projectForm.get('title')?.invalid) {
          <small class="p-error">Title is required.</small>
        }
      </div>

      <div class="flex flex-column gap-2">
        <label for="category" class="font-bold text-900">Category</label>
        <input pInputText id="category" formControlName="category" placeholder="e.g. Web Development" class="w-full" />
        @if (projectForm.get('category')?.touched && projectForm.get('category')?.invalid) {
          <small class="p-error">Category is required.</small>
        }
      </div>

      <div class="flex flex-column gap-2">
        <label for="image" class="font-bold text-900">Image URL</label>
        <input pInputText id="image" formControlName="image" placeholder="https://..." class="w-full" />
        @if (projectForm.get('image')?.touched && projectForm.get('image')?.invalid) {
          <small class="p-error">Valid image URL is required.</small>
        }
      </div>

      <div class="flex flex-column gap-2">
        <label for="link" class="font-bold text-900">Project Link (Optional)</label>
        <input pInputText id="link" formControlName="link" placeholder="https://..." class="w-full" />
      </div>

      <div class="flex flex-column gap-2">
        <label for="description" class="font-bold text-900">Description</label>
        <textarea 
          pTextarea 
          id="description" 
          formControlName="description" 
          rows="5" 
          placeholder="Describe the project..."
          class="w-full"></textarea>
        @if (projectForm.get('description')?.touched && projectForm.get('description')?.invalid) {
          <small class="p-error">Description is required.</small>
        }
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <p-button label="Cancel" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="onCancel()" />
        <p-button 
          [label]="isEdit ? 'Update Project' : 'Add Project'" 
          [icon]="isEdit ? 'pi pi-check' : 'pi pi-plus'" 
          type="submit" 
          [disabled]="projectForm.invalid || loading" 
          [loading]="loading" />
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDialog implements OnInit {
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private projectService = inject(ProjectService);

  projectForm: FormGroup;
  isEdit = false;
  loading = false;

  constructor() {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', [Validators.required]],
      description: ['', Validators.required],
      link: ['']
    });
  }

  ngOnInit() {
    if (this.config.data?.project?._id) {
      this.isEdit = true;
      this.projectForm.patchValue(this.config.data.project);
    }
  }

  onSubmit() {
    if (this.projectForm.invalid) return;

    this.loading = true;
    const projectData = this.projectForm.value;

    if (this.isEdit) {
      this.projectService.updateProject(this.config.data.project._id, projectData).subscribe({
        next: (res) => {
          this.ref.close(res.data);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (res) => {
          this.ref.close(res.data);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  onCancel() {
    this.ref.close();
  }
}
