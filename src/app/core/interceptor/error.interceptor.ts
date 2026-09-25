import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError, timeout, TimeoutError } from 'rxjs';
import { CLAVES_STORAGE } from '../constants/storage.const';

/** Tiempo máximo de espera de una petición antes de cancelarla. */
const TIEMPO_ESPERA_MS = 30000;

/** Errores donde el backend explica qué falló (validaciones, duplicados, no existe…). */
const ESTADOS_CON_MENSAJE_DEL_BACKEND = [400, 404, 409, 422];

/** Error que reciben los componentes en el `error` del subscribe. */
export interface IErrorHttp {
  status: number;
  message: string;
}

export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(TIEMPO_ESPERA_MS),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError((): IErrorHttp => ({
            status: 0,
            message: 'La solicitud tardó demasiado. Intente nuevamente.'
          }));
        }

        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }

        // En el login, el 401 significa "credenciales incorrectas" y lo maneja el componente
        if (req.url.includes('/login') && error.status === 401) {
          return throwError(() => error);
        }

        if (error.status === 401) {
          this.cerrarSesionExpirada();
        }

        return throwError((): IErrorHttp => ({
          status: error.status,
          message: this.obtenerMensaje(error)
        }));
      })
    );
  }

  private obtenerMensaje(error: HttpErrorResponse): string {
    const mensajeBackend: string | undefined = error.error?.message;

    if (ESTADOS_CON_MENSAJE_DEL_BACKEND.includes(error.status) && mensajeBackend) {
      return mensajeBackend;
    }

    switch (error.status) {
      case 0:
        return 'No hay conexión con el servidor.';
      case 400:
        return 'Los datos enviados no son válidos.';
      case 401:
        return 'Su sesión expiró. Vuelva a iniciar sesión.';
      case 403:
        return 'No tiene permisos para realizar esta acción.';
      case 404:
        return 'No se encontró el recurso solicitado.';
      case 409:
        return 'El registro ya existe o entra en conflicto con otro.';
      case 413:
        return 'El archivo es demasiado grande. Use una imagen más liviana.';
      case 422:
        return 'No se pudo procesar la información enviada.';
      case 500:
        return 'Error interno del servidor.';
      case 502:
      case 503:
      case 504:
        return 'El servidor no está disponible. Intente en unos minutos.';
      default:
        return mensajeBackend || 'Ocurrió un error inesperado.';
    }
  }

  private cerrarSesionExpirada(): void {
    localStorage.removeItem(CLAVES_STORAGE.token);

    // Si varias peticiones fallan a la vez, se redirige una sola vez
    if (!this.router.url.startsWith('/login')) {
      this.router.navigate(['/login'], { queryParams: { motivo: 'expirada' } });
    }
  }
}
