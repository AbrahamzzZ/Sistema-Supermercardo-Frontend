import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

export class LoaderInterceptor implements HttpInterceptor {
  private readonly loaderService = inject(LoaderService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.loaderService.hide();
      })
    );
  }
}