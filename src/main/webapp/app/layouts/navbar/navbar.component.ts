import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { LaunchDarklyService, UserContext } from 'app/services/launchdarkly.service';
import { ThemeService } from 'app/core/theme/theme.service';

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [RouterModule, SharedModule],
})
export default class NavbarComponent implements OnInit {
  userContext = signal<UserContext | null>(null);
  isNavbarCollapsed = signal(true);
  isDarkMode = computed(() => this.themeService.isDark());

  private readonly ldService = inject(LaunchDarklyService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.ldService.getUserContext().subscribe(context => {
      this.userContext.set(context);
    });
  }

  getTierBadgeClass(): string {
    const prefix = this.userContext()?.prefix ?? '';
    if (!prefix) return 'badge bg-secondary ms-2';
    if (prefix === 'beta') return 'badge bg-secondary ms-2';
    if (prefix === 'test') return 'badge bg-info ms-2';
    if (prefix === 'premium') return 'badge bg-warning text-dark ms-2';
    return 'badge bg-secondary ms-2';
  }

  getTierLabel(): string {
    const prefix = this.userContext()?.prefix ?? '';
    if (!prefix) return '';
    return prefix.toUpperCase();
  }

  getThemeToggleIcon(): string {
    return this.isDarkMode() ? 'fas fa-sun' : 'fas fa-moon';
  }

  getThemeToggleLabel(): string {
    return this.isDarkMode() ? 'Light mode' : 'Dark mode';
  }

  async logout(): Promise<void> {
    await this.ldService.switchToAnonymous();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed.update(val => !val);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }
}
