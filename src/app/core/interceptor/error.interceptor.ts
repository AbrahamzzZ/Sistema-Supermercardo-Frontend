import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (req.url.includes('/login') && error.status === 401) {
          return throwError(() => error);
        }

        let message = 'Error desconocido';

        switch (error.status) {
          case 0:
            message = 'No hay conexión con el servidor';
            break;
          case 307:
            message = 'Ocurrió un error al consultar los servicios.';
            break;
          case 401:
            message = 'Sesión caducada, vuelva a iniciar sesión.';
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
            break;
          case 403:
            message = 'No tiene permisos para esta acción';
            break;
          case 404:
            message = 'Recurso no encontrado';
            break;
          case 500:
            message = 'Error interno del servidor';
            break;
          default:
            message = error.error?.message || error.message || message;
            break;
        }

        return throwError(() => ({
          status: error.status,
          message
        }));
      })
    );
  }
}