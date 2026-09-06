import { HttpClient } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { ILogin } from '../interfaces/Dto/login';
import { Observable } from 'rxjs';
import { appsettings } from '../setting/api/appsettings';
import { ITokenData } from '../setting/token/itoken-data';
import { jwtDecode } from 'jwt-decode';
import { NavigationStart, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private inactivityDialogRef?: MatDialogRef<ModalInactividadComponent>;
  private cerrarDialogoSinCerrarSesion = false;
  private readonly activityEvents = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
  private readonly resetearPorActividad = () => this.resetear();
  private  readonly apiUrl: string = appsettings.apiUrl + 'Usuario';

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url.startsWith('/login')) {
        this.detenerMonitoreo();
      }
    });
  }

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
    this.detenerMonitoreo();
    this.resetear();

    this.activityEvents.forEach((event) => {
      window.addEventListener(event, this.resetearPorActividad);
    });
  }

  resetear() {
    if (!this.obtenerSesionValida() || this.router.url.startsWith('/login')) {
      return;
    }

    if (this.inactivityDialogRef) {
      return;
    }

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
    if (!this.obtenerSesionValida() || this.router.url.startsWith('/login')) {
      return;
    }

    const dialogRef = this.dialog.open(ModalInactividadComponent, {
      width: '400px',
      disableClose: true,
      data: { tiempoRestante: 60 }
    });
    this.inactivityDialogRef = dialogRef;

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
      this.inactivityDialogRef = undefined;

      if (this.cerrarDialogoSinCerrarSesion) {
        this.cerrarDialogoSinCerrarSesion = false;
        return;
      }

      if (result === true) {
        this.resetear();
      } else {
        this.logoutPorInactividad();
      }
    });
  }

  detenerMonitoreo() {
    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;

    this.activityEvents.forEach((event) => {
      window.removeEventListener(event, this.resetearPorActividad);
    });

    if (this.inactivityDialogRef) {
      this.cerrarDialogoSinCerrarSesion = true;
      this.inactivityDialogRef.close();
    }
    this.inactivityDialogRef = undefined;
  }

  private obtenerSesionValida(): boolean {
    const token = this.obtenerToken();
    if (!token) {
      return false;
    }

    try {
      const { exp } = jwtDecode<{ exp?: number }>(token);
      return !exp || exp * 1000 > Date.now();
    } catch {
      return false;
    }
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
