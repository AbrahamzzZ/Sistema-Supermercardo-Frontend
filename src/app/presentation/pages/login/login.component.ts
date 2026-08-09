import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ILogin } from '../../../core/interfaces/Dto/login';
import { LoginService } from '../../../core/services/login.service';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public hide = true;
  private readonly loginServicio = inject(LoginService);
  public loginForm!: FormGroup;
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  ngOnInit() {
    this.loginForm = new FormGroup({
      correoElectronico: new FormControl('', [Validators.required, Validators.email]),
      clave: new FormControl('', [Validators.required])
    });

    const tieneToken = localStorage.getItem('token');
    const yaShownMessage = sessionStorage.getItem('logout-message-shown');

    this.route.queryParams.subscribe((params) => {
      if (params['motivo'] && !tieneToken && !yaShownMessage) {
        if (params['motivo'] === 'inactividad') {
          this.mostrarMensaje('La sesión fue cerrada por inactividad', 'inactivity');
        } else if (params['motivo'] === 'sesion') {
          this.mostrarMensaje('La sesión fue cerrada exitosamente', 'logout');
        }

        
        sessionStorage.setItem('logout-message-shown', 'true');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  login() {
    if (this.loginForm.valid) {
      const credenciales: ILogin = {
        correo_Electronico: this.loginForm.get('correoElectronico')?.value,
        clave: this.loginForm.get('clave')?.value
      };
      this.loginServicio.login(credenciales).subscribe({
        next: (response: any) => {
          this.loginServicio.guardarToken(response.data.token);

          if (response) {
            sessionStorage.removeItem('logout-message-shown');
            this.loginServicio.iniciarMonitoreo();
            this.mostrarMensaje('Inicio de sesión exitoso', 'success');
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          if (error.status === 500) {
            this.mostrarMensaje(
              'Su usuario está inactivo. Contacte con el administrador.',
              'error'
            );
          } else if (error.status === 401) {
            this.mostrarMensaje('Correo o clave incorrecta.', 'error');
          } else {
            this.mostrarMensaje('Error inesperado al iniciar sesión.', 'error');
          }
        }
      });
    }
  }

  mostrarMensaje(mensaje: string,  tipo: 'success' | 'error' | 'logout' | 'inactivity' = 'success') {
    let className: string;
    let textoAccion: string;

    switch (tipo) {
      case 'success':
        className = 'success-snackbar';
        textoAccion = 'Bienvenido al Sistema';
        break;
      case 'logout':
        className = 'logout-snackbar';
        textoAccion = 'Sesión Cerrada';
        break;
      case 'inactivity':
        className = 'inactivity-snackbar';
        textoAccion = 'Sesión Cerrada';
        break;
      case 'error':
      default:
        className = 'inactivity-snackbar';
        textoAccion = 'Error';
        break;
    }

    this.snackBar.open(mensaje, textoAccion, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }
}
