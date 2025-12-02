import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
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
                message = 'Recurso no encontrado.'
                break;
            case 500:
                message = 'Error interno del servidor (500).'
            break;
            default:
                message = error.error?.mensaje || error.message || message;
                break;
        }

        const apiError = {
          existeError: true,
          mensaje: message,
          data: []
        };

        return throwError(() => apiError);
      })
    );
  }
}