import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { LaunchDarklyService } from 'app/services/launchdarkly.service';

/**
 * 🎯 DEMO: Login Component
 * 
 * This is where FLAG #1 (conversationid-prefix) gets evaluated.
 * 
 * User inputs:
 * - Email: Used as the LaunchDarkly user context key
 * - Beta checkbox: Custom attribute for targeting rules
 * 
 * What happens on login:
 * 1. LaunchDarkly SDK initializes with user context: { email, beta }
 * 2. FLAG #1 is evaluated based on targeting rules you configure
 * 3. A tier prefix is returned: "premium", "test", "beta", or "" (empty)
 * 4. A conversation ID is generated: "{prefix}_conv_{uniqueId}"
 * 5. User is redirected to chat page
 * 
 * Examples:
 * - premium@example.com → "premium_conv_abc123"
 * - test@disney.com → "test_conv_xyz789"
 * - beta@example.com (beta=true) → "beta_conv_def456"
 * - user@example.com → "conv_ghi789" (no prefix)
 */
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

  /**
   * 🎯 DEMO: Login Flow
   * Initializes LaunchDarkly and evaluates FLAG #1 (conversationid-prefix)
   */
  async login(): Promise<void> {
    this.authenticationError.set(false);
    this.isLoading.set(true);

    const { email, beta } = this.loginForm.getRawValue();
    
    console.log('🔐 Logging in with:', { email, beta });

    try {
      // 🎯 FLAG #1: Initialize LaunchDarkly and evaluate 'conversationid-prefix'
      await this.ldService.initialize(email, beta);
      
      // Navigate to chat page (where conversation ID will be visible)
      this.router.navigate(['/chat']);
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.authenticationError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
