import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    RouterModule
  ],
  providers: [MessageService],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  isLoading = signal(false);
  currentUser = this.authService.currentUser;

  returnUrl = computed(() => {
    return this.currentUser()?.['role'] === 'admin' ? '/admin' : '/home';
  });

  returnLabel = computed(() => {
    return this.currentUser()?.['role'] === 'admin' ? 'Back to Admin Dashboard' : 'Back to Home';
  });

  passwordForm: FormGroup = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { oldPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ oldPassword, newPassword }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully'
        });
        setTimeout(() => this.router.navigate([this.returnUrl()]), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to change password'
        });
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
