import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaunchDarklyService } from '../services/launchdarkly.service';

/**
 * HTTP Interceptor that adds the conversationID as a header to all outgoing requests.
 * This allows the backend to use the conversationID for LaunchDarkly context without
 * requiring it in every request payload.
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

      return next.handle(clonedRequest);
    }

    // No conversationID available (e.g., user not logged in)
    return next.handle(req);
  }
}
