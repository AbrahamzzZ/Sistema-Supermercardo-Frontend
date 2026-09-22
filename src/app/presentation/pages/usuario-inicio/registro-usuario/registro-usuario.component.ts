import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { IUsuario } from '../../../../core/interfaces/usuario';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Metodos } from '../../../../shared/utility/metodos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { RolService } from '../../../../core/services/rol.service';
import { IRol } from '../../../../core/interfaces/rol';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-usuario',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-usuario.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-usuario.component.scss'
})
export class RegistroUsuarioComponent implements OnInit, CanComponentDeactive {
  private readonly idUsuario = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly usuarioServicio = inject(UsuarioService);
  private readonly rolServicio = inject(RolService);
  protected readonly roles = signal<IRol[]>([]);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly usuarioModel = signal({
    codigo: Metodos.generarCodigo(),
    nombre_Completo: '',
    clave: '',
    correo_Electronico: '',
    rol: 0,
    estado: false
  });

  protected readonly usuarioForm = form(this.usuarioModel, (schema) => {
    required(schema.nombre_Completo, {message: 'Ingrese su nombre completo'});
    required(schema.clave, {message: 'Ingrese su clave'});
    minLength(schema.clave, 10, {message: 'La clave debe tener mínimo 10 caracteres.'});
    required(schema.correo_Electronico, {message: 'Ingrese su correo electrónico.'});
    maxLength(schema.correo_Electronico, 50, {message: 'El correo electrónico es demasiado largo.'});
    email(schema.correo_Electronico, {message: 'Ingrese un correo valido'});
    Validaciones.soloLetrasSignal(schema.nombre_Completo);
    Validaciones.formatoClaveSignal(schema.clave);
    Validaciones.rolRequeridoSignal(schema.rol);
  });

  private tieneCambioSinGuardar() : boolean {
    return this.usuarioModel().nombre_Completo !== '' || this.usuarioModel().clave !== '' || this.usuarioModel().correo_Electronico !== '' || this.usuarioModel().rol !== 0;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {

    if (this.tieneCambioSinGuardar()) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idUsuario.set(Number.parseInt(this.route.snapshot.params['id']));
    }

    this.rolServicio.lista().subscribe({
      next: (resp: any) => {
        this.roles.set(resp.data);
      },
      error: (err) => {
        console.error('Error al obtener los roles:', err);
      }
    });
  }

  async registrarUsuario() {
    await submit(this.usuarioForm, async (form) =>{
      const usuario: IUsuario = {
        id_Usuario: this.idUsuario() || 0,
        codigo: Metodos.generarCodigo(),
        nombre_Completo: form().value().nombre_Completo.trim(),
        clave: form().value().clave.trimEnd(),
        id_Rol: form().value().rol || 0,
        correo_Electronico: form().value().correo_Electronico.trimEnd(),
        estado: form().value().estado
      }

      this.guardando.set(true);

      this.usuarioServicio.registrar(usuario).subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/usuario'], { skipLocationChange: true });
            this.mostrarMensaje('¡Usuario registrado exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar al usuario', 'error');
        },
        complete: () => this.guardando.set(false)
      });
    });
  }

  regresar() {
    this.router.navigate(['/usuario']);
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    const className = tipo === 'success' ? 'success-snackbar' : 'error-snackbar';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }

  canDeactive(): boolean {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
