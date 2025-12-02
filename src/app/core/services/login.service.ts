import { HttpClient } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { ILogin } from '../interfaces/Dto/login';
import { Observable } from 'rxjs';
import { appsettings } from '../setting/api/appsettings';
import { ITokenData } from '../setting/token/itoken-data';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalInactividadComponent } from '../../presentation/components/modal/modal-inactividad/modal-inactividad.component';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly dialog = inject(MatDialog);
  private readonly timeoutInMs: number = 10 * 60 * 1000; // 10 minutos
  private timeoutId: any;
  private  readonly apiUrl: string = appsettings.apiUrl + 'Usuario';

  login(credenciales: ILogin): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  eliminarToken(): void {
    localStorage.removeItem('token');
  }

  obtenerDatosToken(): ITokenData | null {
    const token = this.obtenerToken();
    if (token) {
      const decoded: any = jwtDecode(token);

      const data: ITokenData = {
        nameid: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        postal_code: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/postalcode'],
        unique_name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        exp: decoded.exp,
        iss: decoded.iss,
        aud: decoded.aud
      };

      return data;
    }
    return null;
  }

  obtenerPermisosDesdeToken(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const payload = JSON.parse(atob(token.split('.')[1]));
    const permisos = payload['permiso'];

    return Array.isArray(permisos) ? permisos : [permisos];
  }

  iniciarMonitoreo() {
    this.resetear();

    const eventos = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    eventos.forEach((event) => {
      window.addEventListener(event, () => this.resetear());
    });
  }

  resetear() {
    clearTimeout(this.timeoutId);

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.mostrarModalAdvertencia();
        });
      }, this.timeoutInMs - 60000);
    });
  }

  private mostrarModalAdvertencia() {
    const dialogRef = this.dialog.open(ModalInactividadComponent, {
      width: '400px',
      disableClose: true,
      data: { tiempoRestante: 60 }
    });

    let segundos = 60;
    const interval = setInterval(() => {
      segundos--;
      dialogRef.componentInstance.data.tiempoRestante = segundos;

      if (segundos <= 0) {
        clearInterval(interval);
        dialogRef.close();
        this.logoutPorInactividad();
      }
    }, 1000);

    dialogRef.afterClosed().subscribe((result) => {
      clearInterval(interval);
      if (result === true) {
        this.resetear();
      } else {
        this.logoutPorInactividad();
      }
    });
  }

  detenerMonitoreo() {
    clearTimeout(this.timeoutId);
    const eventos = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

    eventos.forEach((event) => {
      window.removeEventListener(event, this.resetear.bind(this));
    });
  }

  logoutPorInactividad() {
    this.detenerMonitoreo();
    this.eliminarToken();
    this.router.navigate(['/login'], {
      queryParams: { motivo: 'inactividad' }
    });
  }

  logout() {
    this.detenerMonitoreo();
    this.eliminarToken();
    this.router.navigate(['/login'], {
      queryParams: { motivo: 'sesion' }
    });
  }
}
