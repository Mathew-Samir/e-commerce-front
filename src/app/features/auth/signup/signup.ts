import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RouterModule, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { TermsAndConditions } from '../../e-commerce/pages/terms-and-conditions/terms-and-conditions';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    RadioButtonModule,
    CheckboxModule,
    ButtonModule,
    MessageModule,
    FloatLabelModule,
    RouterModule,
    DialogModule,
    TermsAndConditions,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showTermsDialog = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    mobile: ['', [Validators.required]],
    email: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    gender: [null],
    termsAccepted: [false, [Validators.requiredTrue]],
  });

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.authService.register(this.signupForm.value).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res['success']) {
            if (res['user'].role === 'user') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/admin-dashboard']);
            }
          } else {
            this.errorMessage.set(res['message'] || 'Registration failed');
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'An error occurred during registration');
        },
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  get f() {
    return this.signupForm.controls;
  }
}
