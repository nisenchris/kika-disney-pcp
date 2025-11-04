import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface ChatRequest {
  message: string;
  // conversationID is now passed via X-Conversation-ID header (see ConversationIdInterceptor)
}

export interface ChatResponse {
  textResponse: string;
  voiceAudioUrl: string | null;
  backendFlagResult: boolean;
  conversationID: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatApiService {
  private http = inject(HttpClient);
  private applicationConfigService = inject(ApplicationConfigService);

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.applicationConfigService.getEndpointFor('api/chat/message'), request);
  }
}
