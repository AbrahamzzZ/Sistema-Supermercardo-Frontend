import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IProveedor } from '../../../../core/interfaces/proveedor';
import { Metodos } from '../../../../shared/utility/metodos';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './registro-proveedor.component.html',
  styleUrl: './registro-proveedor.component.scss'
})
export class RegistroProveedorComponent implements OnInit, CanComponentDeactive {
  private idProveedor!: number;
  private readonly route = inject(ActivatedRoute);
  private readonly proveedorServicio = inject(ProveedorService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  public formProveedor = this.formBuilder.nonNullable.group({
    codigo: [Metodos.generarCodigo()],
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
    if (this.route.snapshot.params['id']) {
      this.idProveedor = Number.parseInt(this.route.snapshot.params['id']);
    }
  }

  registrarProveedor() {
    const proveedor: IProveedor = {
      id_Proveedor: this.idProveedor || 0,
      codigo: Metodos.generarCodigo(),
      nombres: this.formProveedor.value.nombres?.trim() ?? '',
      apellidos: this.formProveedor.value.apellidos?.trim() ?? '',
      cedula: this.formProveedor.value.cedula?.trim() ?? '',
      telefono: this.formProveedor.value.telefono?.trim() ?? '',
      correo_Electronico: this.formProveedor.value.correoElectronico?.trim() ?? '',
      estado: this.formProveedor.value.estado ?? false,
      fecha_Registro: Metodos.getFechaCreacion()
    };

    this.formProveedor.markAllAsTouched();

    if (!this.formProveedor.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.proveedorServicio.registrar(proveedor).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/proveedor'], { skipLocationChange: true });
          this.mostrarMensaje('¡Proveedor registrado exitosamente!', 'success');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error 400:', err.error);
        if (err.error?.errors) {
          Object.entries(err.error.errors).forEach(([campo, errores]) => {
            console.log(`Error en ${campo}:`, errores);
          });
          this.mostrarMensaje('Error al registrar el proveedor', 'error');
        }
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

  canDeactive(): boolean | Observable<boolean> {
    const camposEditables = ['nombres', 'apellidos', 'cedula', 'telefono', 'correoElectronico'];
    const camposVacios = camposEditables.some(
      (campo) => this.formProveedor.get(campo)?.value === ''
    );
    const camposConDatos = camposEditables.some(
      (campo) => this.formProveedor.get(campo)?.value !== ''
    );

    return camposConDatos && camposVacios ? false : true;
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
