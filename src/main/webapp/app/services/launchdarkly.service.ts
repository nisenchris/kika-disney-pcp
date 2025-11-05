import { Injectable } from '@angular/core';
import * as LDClient from 'launchdarkly-js-client-sdk';
import { nanoid } from 'nanoid';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';

/**
 * 🎯 DEMO: Frontend LaunchDarkly Integration
 * 
 * This service demonstrates FLAG #1: conversationid-prefix
 * 
 * What it does:
 * - Evaluates the 'conversationid-prefix' flag based on user attributes (email, beta)
 * - Returns a tier prefix: "premium", "test", "beta", or "" (empty string)
 * - Generates a conversation ID like: "premium_conv_abc12345"
 * - This ID is sent to the backend via HTTP header (X-Conversation-ID)
 * 
 * The backend NEVER sees user email - only the conversation ID!
 */

export interface UserContext {
  email: string;
  beta: boolean;
  prefix: string; // Result of 'conversationid-prefix' flag
  conversationId: string; // Generated ID with prefix: "{prefix}_conv_{uniqueId}"
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

  /**
   * 🎯 DEMO STEP 1: User Login
   * Initializes LaunchDarkly and evaluates the conversation-prefix flag
   */
  async initialize(email: string, beta: boolean): Promise<void> {
    if (!environment.ldClientId) {
      console.warn('⚠️ LaunchDarkly client ID not configured. Using default (no prefix).');
      const prefix = '';
      const conversationId = this.generateConversationId(prefix);
      this.userContext$.next({ email, beta, prefix, conversationId });
      return;
    }

    try {
      // Create user context for LaunchDarkly (client-side flag evaluation)
      const user: LDClient.LDContext = {
        kind: 'user',
        key: email,
        email,
        beta,
      };

      console.log('🚀 Initializing LaunchDarkly with user context:', { email, beta });
      this.ldClient = LDClient.initialize(environment.ldClientId, user);
      await this.ldClient.waitForInitialization();

      // 🎯 FLAG #1: Evaluate 'conversationid-prefix'
      // This determines the tier based on LaunchDarkly targeting rules
      const prefix = this.ldClient.variation('conversationid-prefix', '');
      const conversationId = this.generateConversationId(prefix);

      console.log('✅ Flag evaluated: conversationid-prefix =', prefix || '(empty)');
      console.log('📋 Generated conversation ID:', conversationId);

      this.userContext$.next({ email, beta, prefix, conversationId });
    } catch (error) {
      console.error('❌ Error initializing LaunchDarkly:', error);
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

  /**
   * Returns the current conversation prefix from the flag evaluation
   */
  getConversationPrefix(): string {
    if (!this.ldClient) {
      return this.userContext$.value?.prefix ?? '';
    }
    return this.ldClient.variation('conversationid-prefix', '') as string;
  }

  /**
   * Optional: Client-side voice flag (not used in this demo)
   * This demo uses SERVER-SIDE flag evaluation instead (see backend)
   */
  isVoiceEnabled(): boolean {
    if (!this.ldClient) {
      return false;
    }
    return this.ldClient.variation('voice-chat-enabled-client', false) as boolean;
  }

  /**
   * 🎯 DEMO: Conversation ID Generation
   * Creates a unique conversation ID with the tier prefix
   * 
   * Examples:
   * - prefix="premium" → "premium_conv_a1b2c3d4"
   * - prefix="test"    → "test_conv_x9y8z7w6"
   * - prefix=""        → "conv_m5n4o3p2" (anonymous)
   */
  private generateConversationId(prefix: string): string {
    const uniqueId = nanoid(8);
    if (prefix) {
      return `${prefix}_conv_${uniqueId}`;
    }
    return `conv_${uniqueId}`;
  }
}
