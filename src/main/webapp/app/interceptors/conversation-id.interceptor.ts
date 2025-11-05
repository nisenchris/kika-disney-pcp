import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaunchDarklyService } from '../services/launchdarkly.service';

/**
 * 🎯 DEMO: Conversation ID Header Interceptor
 * 
 * This interceptor automatically adds the X-Conversation-ID header to ALL HTTP requests.
 * 
 * Why use a header instead of request body?
 * - Conversation ID is contextual metadata (like auth tokens)
 * - Automatic injection - developers never forget to add it
 * - Backend can extract it consistently from headers
 * - Clean separation: headers = context, body = business data
 * 
 * 🎯 DEMO STEP 2: When user sends a chat message
 * - This interceptor automatically adds: X-Conversation-ID: premium_conv_abc12345
 * - Backend receives this header and uses it for FLAG #2 evaluation
 * - Backend NEVER sees the user's email - only the conversation ID!
 */
@Injectable()
export class ConversationIdInterceptor implements HttpInterceptor {
  constructor(private ldService: LaunchDarklyService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userContext = this.ldService.getCurrentUserContext();

    // Only add header if we have a conversationID
    if (userContext?.conversationId) {
      const clonedRequest = req.clone({
        setHeaders: {
          'X-Conversation-ID': userContext.conversationId,
        },
      });

      // 🎯 DEMO: Log for visibility during live demo
      if (req.url.includes('/api/chat/message')) {
        console.log('📤 Sending request with X-Conversation-ID:', userContext.conversationId);
      }

      return next.handle(clonedRequest);
    }

    // No conversationID available (e.g., user not logged in)
    return next.handle(req);
  }
}
