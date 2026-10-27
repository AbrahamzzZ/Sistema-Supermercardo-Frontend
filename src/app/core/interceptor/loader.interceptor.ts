import {
  HttpContextToken,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

// Peticiones que ya muestran su propio indicador (ej. skeleton de tabla) no activan la barra global.
export const OMITIR_LOADER = new HttpContextToken<boolean>(() => false);

export class LoaderInterceptor implements HttpInterceptor {
  private readonly loaderService = inject(LoaderService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.context.get(OMITIR_LOADER)) {
      return next.handle(req);
    }

    this.loaderService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }
}
