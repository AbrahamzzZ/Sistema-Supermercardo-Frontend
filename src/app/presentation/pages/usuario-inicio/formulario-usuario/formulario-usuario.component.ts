import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formulario-usuario',
  imports: [MaterialModule, FormField],
  templateUrl: './formulario-usuario.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-usuario.component.scss'
})
export class FormularioUsuarioComponent implements OnInit, CanComponentDeactive {
  private readonly idUsuario = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idUsuario() > 0);

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

  // Valores con los que se inició el formulario (vacíos al registrar, los del usuario al editar).
  private valoresIniciales = this.usuarioModel();

  protected readonly usuarioForm = form(this.usuarioModel, (schema) => {
    required(schema.nombre_Completo, {message: 'Ingrese su nombre completo'});
    maxLength(schema.nombre_Completo, 70, {message: 'El nombre es demasiado largo.'});
    // Al editar, la clave es opcional: si se deja vacía se conserva la actual.
    required(schema.clave, {message: 'Ingrese su clave', when: () => !this.esEdicion()});
    minLength(schema.clave, 10, {message: 'La clave debe tener mínimo 10 caracteres.'});
    required(schema.correo_Electronico, {message: 'Ingrese su correo electrónico.'});
    maxLength(schema.correo_Electronico, 50, {message: 'El correo electrónico es demasiado largo.'});
    email(schema.correo_Electronico, {message: 'Ingrese un correo valido'});
    Validaciones.soloLetrasSignal(schema.nombre_Completo);
    Validaciones.formatoClaveSignal(schema.clave);
    Validaciones.rolRequeridoSignal(schema.rol);
  });

  private tieneCambioSinGuardar(): boolean {
    const actual = this.usuarioModel();
    const inicial = this.valoresIniciales;
    return actual.nombre_Completo !== inicial.nombre_Completo
      || actual.clave !== inicial.clave
      || actual.correo_Electronico !== inicial.correo_Electronico
      || actual.rol !== inicial.rol
      || actual.estado !== inicial.estado;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {

    if (this.tieneCambioSinGuardar()) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id > 0) {
      this.idUsuario.set(id);
      this.cargarUsuario();
    }

    this.rolServicio.lista().subscribe({
      next: (resp: any) => {
        this.roles.set(resp.data);
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar los roles.', 'error');
        console.error('Error al obtener los roles:', err);
      }
    });
  }

  private cargarUsuario(): void {
    this.usuarioServicio.obtener(this.idUsuario()).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.usuarioModel.set({
            codigo: resp.data.codigo,
            nombre_Completo: resp.data.nombre_Completo,
            clave: '',
            correo_Electronico: resp.data.correo_Electronico,
            rol: resp.data.id_Rol,
            estado: resp.data.estado
          });
          this.valoresIniciales = this.usuarioModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del usuario.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.usuarioForm, async (form) => {
      const valores = form().value();
      const usuario: IUsuario = {
        id_Usuario: this.idUsuario(),
        codigo: valores.codigo,
        nombre_Completo: valores.nombre_Completo.trim(),
        clave: valores.clave.trimEnd(),
        id_Rol: valores.rol || 0,
        correo_Electronico: valores.correo_Electronico.trimEnd(),
        estado: valores.estado
      };

      const peticion = this.esEdicion()
        ? this.usuarioServicio.editar(usuario)
        : this.usuarioServicio.registrar(usuario);
      const accion = this.esEdicion() ? 'editado' : 'registrado';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/usuario'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Usuario ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar el usuario' : 'Error al registrar al usuario', 'error');
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

  canDeactive(): boolean | Observable<boolean> {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
