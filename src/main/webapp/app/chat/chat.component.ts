import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LaunchDarklyService, UserContext } from 'app/services/launchdarkly.service';
import { ChatApiService, ChatResponse } from 'app/services/chat-api.service';
import AudioVisualizerComponent from './audio-visualizer/audio-visualizer.component';

/**
 * 🎯 DEMO: Chat Component
 * 
 * This component demonstrates the complete flag coordination flow:
 * 
 * 1. Displays user context from FLAG #1 (conversationid-prefix):
 *    - User email and beta status
 *    - Assigned tier prefix (premium, test, beta, or none)
 *    - Generated conversation ID
 * 
 * 2. Sends messages to backend:
 *    - Conversation ID automatically added via HTTP interceptor as X-Conversation-ID header
 *    - Backend evaluates FLAG #2 (voice-chat-enabled)
 * 
 * 3. Displays backend flag results:
 *    - Shows whether voice is enabled/disabled for this tier
 *    - Displays audio visualizer if voice is enabled
 *    - Shows placeholder message if voice is disabled
 */

interface ChatMessage extends ChatResponse {
  userMessage: string;
  isUser: boolean;
}

@Component({
  selector: 'jhi-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioVisualizerComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export default class ChatComponent implements OnInit {
  // User context from FLAG #1 evaluation (conversationid-prefix)
  userContext = signal<UserContext | null>(null);
  
  messages = signal<ChatMessage[]>([]);
  messageInput = '';
  isSending = signal(false);
  
  // Result from FLAG #2 evaluation (voice-chat-enabled) - returned by backend
  lastBackendFlagResult = signal<boolean | null>(null);

  private readonly ldService = inject(LaunchDarklyService);
  private readonly chatService = inject(ChatApiService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const context = this.ldService.getCurrentUserContext();
    if (!context?.email) {
      // No user logged in - redirect to login
      this.router.navigate(['/login']);
      return;
    }
    this.userContext.set(context);
    console.log('💼 User context loaded:', context);
  }

  get conversationId(): string {
    return this.userContext()?.conversationId ?? '';
  }

  get prefix(): string {
    return this.userContext()?.prefix ?? '';
  }

  get backendVoiceEnabled(): boolean | null {
    return this.lastBackendFlagResult();
  }

  getTierBadgeClass(): string {
    const prefix = this.prefix;
    if (!prefix) return 'badge bg-secondary';
    if (prefix === 'beta') return 'badge bg-secondary';
    if (prefix === 'test') return 'badge bg-info';
    if (prefix === 'premium') return 'badge bg-warning text-dark';
    return 'badge bg-secondary';
  }

  getTierLabel(): string {
    const prefix = this.prefix;
    if (!prefix) return 'NO PREFIX';
    return prefix.toUpperCase();
  }

  /**
   * 🎯 DEMO: Send Message Flow
   * 
   * What happens when user sends a message:
   * 1. ConversationIdInterceptor automatically adds X-Conversation-ID header
   * 2. Backend receives: header + message (NOT user email!)
   * 3. Backend evaluates FLAG #2 (voice-chat-enabled)
   * 4. Response includes flag result and optional voice audio URL
   * 5. Frontend displays the result in the sidebar and message
   */
  async sendMessage(): Promise<void> {
    const message = this.messageInput.trim();
    if (!message || this.isSending()) return;

    this.isSending.set(true);

    try {
      // 🎯 DEMO: Note that we only send the message!
      // The conversationID is automatically added as X-Conversation-ID header by ConversationIdInterceptor
      const response = await firstValueFrom(
        this.chatService.sendMessage({
          message, // Only business data in the request body
        }),
      );

      // Add message to chat history
      this.messages.update(msgs => [
        ...msgs,
        {
          ...response,
          userMessage: message,
          isUser: false,
        },
      ]);
      
      // 🎯 DEMO: Update the sidebar with backend flag result
      this.lastBackendFlagResult.set(response.backendFlagResult);
      
      console.log('📥 Received response - Backend voice flag:', response.backendFlagResult);
      console.log('🎵 Voice audio URL:', response.voiceAudioUrl || '(none)');

      this.messageInput = '';
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      this.isSending.set(false);
    }
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  getBackendFlagBadgeClass(flagResult: boolean): string {
    return flagResult ? 'flag-chip--positive' : 'flag-chip--negative';
  }

  getBackendFlagLabel(flagResult: boolean): string {
    return flagResult ? 'Voice channel · enabled' : 'Voice channel · disabled';
  }

  highlightPrefix(conversationId: string): { prefix: string; rest: string } {
    if (!this.prefix) {
      return { prefix: '', rest: conversationId };
    }
    const parts = conversationId.split('_conv_');
    return { prefix: parts[0] + '_', rest: 'conv_' + parts[1] };
  }
}
