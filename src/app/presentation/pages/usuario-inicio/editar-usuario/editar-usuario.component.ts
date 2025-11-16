import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IUsuario } from '../../../../core/interfaces/usuario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IRol } from '../../../../core/interfaces/rol';
import { RolService } from '../../../../core/services/rol.service';
import { MatSelectChange } from '@angular/material/select';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.scss'
})
export class EditarUsuarioComponent implements OnInit {
  private usuarioServicio = inject(UsuarioService);
  private rolServicio = inject(RolService);
  public roles: IRol[] = [];
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  idUsuario!: number;

  formUsuario = this.formBuilder.nonNullable.group({
    nombreCompleto: [
      '',
      [Validators.required, Validaciones.soloLetras(), Validators.maxLength(70)]
    ],
    clave: ['', [Validators.minLength(10), Validaciones.formatoClave()]],
    correoElectronico: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    rol: [0, [Validators.required, Validaciones.rolRequerido()]],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombreCompleto', 'clave', 'correoElectronico'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formUsuario.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idUsuario = +params['id'];
      if (this.idUsuario) {
        this.cargarUsuario();
        this.cargarRoles();
      }
    });
  }

  cargarUsuario(): void {
    this.usuarioServicio.obtener(this.idUsuario).subscribe({
      next: (resp: any) => {
        if (resp.data) {
          this.formUsuario.patchValue({
            nombreCompleto: resp.data.nombre_Completo,
            correoElectronico: resp.data.correo_Electronico,
            clave: '',
            rol: resp.data.id_Rol,
            estado: resp.data.estado
          });
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del usuario.', 'error');
        console.error(err);
      }
    });
  }

  cargarRoles(): void {
    this.rolServicio.lista().subscribe({
      next: (resp: any) => {
        this.roles = resp.data;
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar los roles.', 'error');
        console.error(err);
      }
    });
  }

  editarUsuario(): void {
    const rolId = this.formUsuario.value.rol;

    const usuario: Partial<IUsuario> = {
      id_Usuario: this.idUsuario,
      nombre_Completo: this.formUsuario.value.nombreCompleto!,
      clave: this.formUsuario.value.clave,
      correo_Electronico: this.formUsuario.value.correoElectronico!,
      id_Rol: rolId ?? 0,
      estado: this.formUsuario.value.estado
    };

    this.formUsuario.markAllAsTouched();

    if (!this.formUsuario.valid) {
      this.mostrarMensaje('Formulatio inválido', 'error');
      return;
    }
    console.log(usuario);

    this.usuarioServicio.editar(usuario).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/usuario']);
          this.mostrarMensaje('¡Usuario editado exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar el Usuario', 'error');
      }
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

  rolSeleccionado(event: MatSelectChange) {
    const rolId = event.value;
    this.formUsuario.controls.rol.setValue(rolId);
  }

  get nombreCompletoField(): FormControl<string> {
    return this.formUsuario.controls.nombreCompleto;
  }

  get claveField(): FormControl<string> {
    return this.formUsuario.controls.clave;
  }

  get correoElectronicoField(): FormControl<string> {
    return this.formUsuario.controls.correoElectronico;
  }

  get rolSeleccionadoField(): FormControl<number> {
    return this.formUsuario.controls.rol;
  }
}
