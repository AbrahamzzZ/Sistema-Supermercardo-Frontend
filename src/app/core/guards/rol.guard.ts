import { inject, Injectable } from '@angular/core';
import { CanMatch, Route, Router, UrlSegment } from '@angular/router';
import { LoginService } from '../services/login.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanMatch {

  private readonly router = inject(Router);
  private readonly authService = inject(LoginService);

  canMatch(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> {
    const permisos = this.authService.obtenerPermisosDesdeToken();
    const url = '/' + segments.map((s) => s.path).join('/');

    if (permisos.some((p) => url.startsWith(p))) {
      //Verifica si la URL actual comienza con algun permiso
      return true;
    } else {
      this.router.navigate(['/home']); // redirigir si no tiene permiso
      return false;
    }
  }
}
