import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { LaunchDarklyService } from 'app/services/launchdarkly.service';

@Component({
  selector: 'jhi-login',
  imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export default class LoginComponent {
  authenticationError = signal(false);
  isLoading = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    beta: new FormControl(false, { nonNullable: true }),
  });

  private readonly ldService = inject(LaunchDarklyService);
  private readonly router = inject(Router);

  async login(): Promise<void> {
    this.authenticationError.set(false);
    this.isLoading.set(true);

    const { email, beta } = this.loginForm.getRawValue();

    try {
      await this.ldService.initialize(email, beta);
      this.router.navigate(['/chat']);
    } catch (error) {
      console.error('Login failed:', error);
      this.authenticationError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
