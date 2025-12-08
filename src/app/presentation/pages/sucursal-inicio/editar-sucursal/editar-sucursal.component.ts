import { Component, HostListener, inject, OnInit } from '@angular/core';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ISucursal } from '../../../../core/interfaces/sucursal';
import { Metodos } from '../../../../shared/utility/metodos';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-editar-sucursal',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './editar-sucursal.component.html',
  styleUrl: './editar-sucursal.component.scss'
})
export class EditarSucursalComponent implements OnInit {
  private readonly sucursalServicio = inject(SucursalService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  public idSucursal!: number;

  public formSucursal = this.formBuilder.nonNullable.group({
    codigo: [Metodos.generarCodigo()],
    nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
    direccion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(90)]],
    latitud: ['', [Validators.required, Validaciones.coordenadaValida()]],
    longitud: ['', [Validators.required, Validaciones.coordenadaValida()]],
    ciudad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombre', 'direccion', 'latitud', 'longitud', 'ciudad'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formSucursal.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idSucursal = +params['id'];
      if (this.idSucursal) {
        this.cargarSucursal();
      }
    });
  }

  cargarSucursal(): void {
    this.sucursalServicio.obtener(this.idSucursal).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formSucursal.patchValue({
            nombre: resp.data.nombre_Sucursal,
            direccion: resp.data.direccion_Sucursal,
            latitud: resp.data.latitud.toString(),
            longitud: resp.data.longitud.toString(),
            ciudad: resp.data.ciudad_Sucursal,
            estado: resp.data.estado
          });
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación de la sucursal.');
        console.error(err);
      }
    });
  }

  editarSucursal(): void {
    const sucursal: Partial<ISucursal> = {
      id_Sucursal: this.idSucursal,
      nombre_Sucursal: this.formSucursal.value.nombre!,
      direccion_Sucursal: this.formSucursal.value.direccion!,
      latitud: Number.parseFloat(this.formSucursal.value.latitud ?? '0'),
      longitud: Number.parseFloat(this.formSucursal.value.longitud ?? '0'),
      ciudad_Sucursal: this.formSucursal.value.ciudad!,
      estado: this.formSucursal.value.estado
    };

    this.formSucursal.markAllAsTouched();

    if (!this.formSucursal.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.sucursalServicio.editar(sucursal).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/sucursal']);
          this.mostrarMensaje('¡Sucursal editada exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar la sucursal', 'error');
      }
    });
  }

  regresar() {
    this.router.navigate(['/sucursal']);
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

  get nombreField(): FormControl<string> {
    return this.formSucursal.controls.nombre;
  }

  get direccionField(): FormControl<string> {
    return this.formSucursal.controls.direccion;
  }

  get ciudadField(): FormControl<string> {
    return this.formSucursal.controls.ciudad;
  }

  get latitudField(): FormControl<string> {
    return this.formSucursal.controls.latitud;
  }

  get longitudField(): FormControl<string> {
    return this.formSucursal.controls.longitud;
  }
}
