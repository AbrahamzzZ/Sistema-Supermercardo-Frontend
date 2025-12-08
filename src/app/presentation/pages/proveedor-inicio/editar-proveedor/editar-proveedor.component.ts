import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../../core/interfaces/proveedor';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-editar-proveedor',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './editar-proveedor.component.html',
  styleUrl: './editar-proveedor.component.scss'
})
export class EditarProveedorComponent implements OnInit {
  private readonly proveedorServicio = inject(ProveedorService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  idProveedor!: number;

  public formProveedor = this.formBuilder.nonNullable.group({
    nombres: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        Validaciones.soloLetras()
      ]
    ],
    apellidos: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        Validaciones.soloLetras()
      ]
    ],
    cedula: ['', [Validators.required, Validaciones.soloNumeros()]],
    telefono: ['', [Validators.required, Validaciones.soloNumeros()]],
    correoElectronico: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombres', 'apellidos', 'cedula', 'telefono', 'correoElectronico'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formProveedor.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idProveedor = +params['id'];
      if (this.idProveedor) {
        this.cargarProvedor();
      }
    });
  }

  cargarProvedor(): void {
    this.proveedorServicio.obtener(this.idProveedor).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formProveedor.patchValue({
            nombres: resp.data.nombres,
            apellidos: resp.data.apellidos,
            cedula: resp.data.cedula,
            telefono: resp.data.telefono,
            correoElectronico: resp.data.correo_Electronico,
            estado: resp.data.estado
          });
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del proveedor.');
        console.error(err);
      }
    });
  }

  editarProveedor(): void {
    const proveedor: Partial<IProveedor> = {
      id_Proveedor: this.idProveedor,
      nombres: this.formProveedor.value.nombres!,
      apellidos: this.formProveedor.value.apellidos!,
      cedula: this.formProveedor.value.cedula!,
      telefono: this.formProveedor.value.telefono!,
      correo_Electronico: this.formProveedor.value.correoElectronico!,
      estado: this.formProveedor.value.estado
    };

    this.formProveedor.markAllAsTouched();

    if (!this.formProveedor.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.proveedorServicio.editar(proveedor).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/proveedor']);
          this.mostrarMensaje('¡Proveedor editado exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar el Proveedor', 'error');
      }
    });
  }

  regresar() {
    this.router.navigate(['/proveedor']);
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

  get nombresField(): FormControl<string> {
    return this.formProveedor.controls.nombres;
  }

  get apellidosField(): FormControl<string> {
    return this.formProveedor.controls.apellidos;
  }

  get cedulaField(): FormControl<string> {
    return this.formProveedor.controls.cedula;
  }

  get telefonoField(): FormControl<string> {
    return this.formProveedor.controls.telefono;
  }

  get correoElectronicoField(): FormControl<string> {
    return this.formProveedor.controls.correoElectronico;
  }
}
