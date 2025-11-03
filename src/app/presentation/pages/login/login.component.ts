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
  private loginServicio = inject(LoginService);
  public loginForm!: FormGroup;
  private snackBar = inject(MatSnackBar);
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  ngOnInit() {
    this.loginForm = new FormGroup({
      correoElectronico: new FormControl('', [Validators.required, Validators.email]),
      clave: new FormControl('', [Validators.required])
    });

    this.route.queryParams.subscribe((params) => {
      if (params['motivo'] === 'inactividad') {
        this.mostrarMensaje('La sesión fue cerrada por inactividad', 'error');
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['motivo'] === 'sesion') {
        this.mostrarMensaje('La sesión fue cerrada exitosamente', 'success');
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

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    const className = tipo === 'success' ? 'success-snackbar' : 'error-snackbar';

    this.snackBar.open(mensaje, 'Bienvenido al Sistema', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }
}
