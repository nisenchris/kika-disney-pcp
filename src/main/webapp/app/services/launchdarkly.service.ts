import { Injectable } from '@angular/core';
import * as LDClient from 'launchdarkly-js-client-sdk';
import { nanoid } from 'nanoid';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface UserContext {
  email: string;
  beta: boolean;
  prefix: string;
  conversationId: string;
}

@Injectable({
  providedIn: 'root',
})
export class LaunchDarklyService {
  private ldClient: LDClient.LDClient | null = null;
  private userContext$ = new BehaviorSubject<UserContext | null>(null);

  getUserContext(): Observable<UserContext | null> {
    return this.userContext$.asObservable();
  }

  getCurrentUserContext(): UserContext | null {
    return this.userContext$.value;
  }

  async initialize(email: string, beta: boolean): Promise<void> {
    if (!environment.ldClientId) {
      // Without LaunchDarkly, use no prefix (anonymous user)
      const prefix = '';
      const conversationId = this.generateConversationId(prefix);
      this.userContext$.next({ email, beta, prefix, conversationId });
      return;
    }

    try {
      // Create LaunchDarkly user context with email and beta attributes
      const user: LDClient.LDContext = {
        kind: 'user',
        key: email,
        email,
        beta,
      };

      this.ldClient = LDClient.initialize(environment.ldClientId, user);

      await this.ldClient.waitForInitialization();

      // Evaluate quick-test-conversation-prefix flag
      // The flag will return whatever prefix YOU configure in LaunchDarkly rules
      // Examples: "test", "premium", "beta", "internal", or "" (empty string)
      const prefix = this.ldClient.variation('quick-test-conversation-prefix', '');
      const conversationId = this.generateConversationId(prefix);

      this.userContext$.next({ email, beta, prefix, conversationId });
    } catch (error) {
      // On error, use no prefix
      const prefix = '';
      const conversationId = this.generateConversationId(prefix);
      this.userContext$.next({ email, beta, prefix, conversationId });
    }
  }

  async switchToAnonymous(): Promise<void> {
    // Generate anonymous conversationID (no prefix)
    const conversationId = this.generateConversationId('');
    this.userContext$.next({ email: '', beta: false, prefix: '', conversationId });

    if (this.ldClient) {
      await this.ldClient.close();
      this.ldClient = null;
    }
  }

  getConversationPrefix(): string {
    if (!this.ldClient) {
      return this.userContext$.value?.prefix ?? '';
    }
    return this.ldClient.variation('quick-test-conversation-prefix', '') as string;
  }

  isVoiceEnabled(): boolean {
    if (!this.ldClient) {
      return false;
    }
    // This would be a client-side flag if needed
    return this.ldClient.variation('quick-test-voice-chat-enabled-client', false) as boolean;
  }

  private generateConversationId(prefix: string): string {
    const uniqueId = nanoid(8);
    if (prefix) {
      return `${prefix}_conv_${uniqueId}`;
    }
    return `conv_${uniqueId}`;
  }
}
