import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeout, catchError, throwError } from 'rxjs';

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const TIMEOUT_MS = 10000; // 10 segundos

  return next(req).pipe(
    timeout(TIMEOUT_MS),
    catchError(err => {
      if (err.name === 'TimeoutError') {
        snackBar.open('La solicitud tardó demasiado y fue cancelada.', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
      return throwError(() => err);
    })
  );
};
