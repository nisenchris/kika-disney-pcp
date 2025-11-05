import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

type ThemeVariant = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = computed(() => this.currentTheme());
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  private readonly storageKey = 'portal-theme';
  private readonly document = inject(DOCUMENT);
  private readonly currentTheme = signal<ThemeVariant>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggle(): void {
    const nextTheme: ThemeVariant = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ThemeVariant): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  private resolveInitialTheme(): ThemeVariant {
    const storedTheme = this.safeStorage()?.getItem(this.storageKey) as ThemeVariant | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }

  private applyTheme(theme: ThemeVariant): void {
    const body = this.document?.body;
    const root = this.document?.documentElement;

    if (!body || !root) {
      return;
    }

    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    root.setAttribute('data-theme', theme);
  }

  private persistTheme(theme: ThemeVariant): void {
    this.safeStorage()?.setItem(this.storageKey, theme);
  }

  private safeStorage(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }
}

