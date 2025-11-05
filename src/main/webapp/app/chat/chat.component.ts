import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LaunchDarklyService, UserContext } from 'app/services/launchdarkly.service';
import { ChatApiService, ChatResponse } from 'app/services/chat-api.service';
import AudioVisualizerComponent from './audio-visualizer/audio-visualizer.component';

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
  userContext = signal<UserContext | null>(null);
  messages = signal<ChatMessage[]>([]);
  messageInput = ''; // Changed from signal to regular string for ngModel
  isSending = signal(false);
  lastBackendFlagResult = signal<boolean | null>(null);

  private readonly ldService = inject(LaunchDarklyService);
  private readonly chatService = inject(ChatApiService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const context = this.ldService.getCurrentUserContext();
    if (!context?.email) {
      this.router.navigate(['/login']);
      return;
    }
    this.userContext.set(context);
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

  async sendMessage(): Promise<void> {
    const message = this.messageInput.trim();
    if (!message || this.isSending()) return;

    this.isSending.set(true);

    try {
      // conversationID is automatically added as X-Conversation-ID header by ConversationIdInterceptor
      const response = await firstValueFrom(
        this.chatService.sendMessage({
          message,
        }),
      );

      this.messages.update(msgs => [
        ...msgs,
        {
          ...response,
          userMessage: message,
          isUser: false,
        },
      ]);
      // Update the backend flag result from the response
      this.lastBackendFlagResult.set(response.backendFlagResult);

      this.messageInput = '';
    } catch (error) {
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
