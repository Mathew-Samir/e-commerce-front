import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FloatLabelModule,
    RouterModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  private route = inject(ActivatedRoute);

  readonly logoSrc = signal('assets/logo.png');
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    mobile: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res['success']) {
            const user = res['user'] || res['data']?.['user'] || res['data'];
            const returnUrl = this.route.snapshot.queryParams['returnUrl'];
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl);
            } else if (user?.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            this.errorMessage.set(res['message'] || 'Login failed');
          }
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'An error occurred during login');
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  get f() {
    return this.loginForm.controls;
  }
}
