import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../../core/services/project.service';
import { Project } from '../../../../core/interface/project.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProjectDialog } from './project-dialog/project-dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-projects-management',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsManagement implements OnInit {
  private projectService = inject(ProjectService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  ref: DynamicDialogRef | null | undefined;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: (res) => {
        if (res.success) {
          this.projects.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load projects' });
        this.loading.set(false);
      }
    });
  }

  showAddDialog() {
    this.ref = this.dialogService.open(ProjectDialog, {
      header: 'Add New Project',
      width: '50vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        project: {}
      }
    });

    this.ref?.onClose.subscribe((project: Project) => {
      if (project) {
        this.loadProjects();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project added successfully' });
      }
    });
  }

  showEditDialog(project: Project) {
    this.ref = this.dialogService.open(ProjectDialog, {
      header: 'Edit Project',
      width: '50vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        project: { ...project }
      }
    });

    this.ref?.onClose.subscribe((updatedProject: Project) => {
      if (updatedProject) {
        this.loadProjects();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated successfully' });
      }
    });
  }

  deleteProject(project: Project) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${project.title}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-plain',
      accept: () => {
        this.projectService.deleteProject(project._id).subscribe({
          next: () => {
            this.loadProjects();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project deleted' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete project' });
          }
        });
      }
    });
  }
}
