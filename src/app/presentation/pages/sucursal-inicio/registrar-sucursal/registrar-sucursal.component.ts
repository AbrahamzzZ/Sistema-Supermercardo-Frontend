import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Metodos } from '../../../../shared/utility/metodos';
import { ISucursal } from '../../../../core/interfaces/sucursal';
import { Observable } from 'rxjs';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { INegocio } from '../../../../core/interfaces/negocio';
import { NegocioService } from '../../../../core/services/negocio.service';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-registrar-sucursal',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './registrar-sucursal.component.html',
  styleUrl: './registrar-sucursal.component.scss'
})
export class RegistrarSucursalComponent implements OnInit, CanComponentDeactive {
  private idSucursal!: number;
  private readonly route = inject(ActivatedRoute);
  private readonly sucursalServicio = inject(SucursalService);
  private readonly negocioServicio = inject(NegocioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  public negocio!: INegocio;

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
    if (this.route.snapshot.params['id']) {
      this.idSucursal = Number.parseInt(this.route.snapshot.params['id']);
    }

    this.negocioServicio.obtener(1).subscribe({
      next: (resp: any) => {
        this.negocio = resp.data;
      },
      error: (err) => {
        this.mostrarMensaje('Error al obtener la información del negocio', err);
      }
    });
  }

  registrarSucursal() {
    const sucursal: ISucursal = {
      id_Sucursal: this.idSucursal || 0,
      id_Negocio: this.negocio.id_Negocio,
      codigo: Metodos.generarCodigo(),
      nombre_Sucursal: this.formSucursal.value.nombre?.trim() ?? '',
      direccion_Sucursal: this.formSucursal.value.direccion?.trim() ?? '',
      latitud: Number.parseFloat(this.formSucursal.value.latitud ?? '0'),
      longitud: Number.parseFloat(this.formSucursal.value.longitud ?? '0'),
      ciudad_Sucursal: this.formSucursal.value.ciudad?.trim() ?? '',
      estado: this.formSucursal.value.estado ?? false
    };

    this.formSucursal.markAllAsTouched();

    if (!this.formSucursal.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    console.log('Sucursal a registrar:', sucursal);

    this.sucursalServicio.registrar(sucursal).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/sucursal'], { skipLocationChange: true });
          this.mostrarMensaje('¡Sucursal registrada exitosamente!', 'success');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error 400:', err.error);
        if (err.error?.errors) {
          Object.entries(err.error.errors).forEach(([campo, errores]) => {
            console.log(`Error en ${campo}:`, errores);
          });
          this.mostrarMensaje('Error al registrar la sucursal', 'error');
        }
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

  canDeactive(): boolean | Observable<boolean> {
    const camposEditables = ['nombre', 'direccion', 'latitud', 'longitud', 'ciudad'];
    const camposVacios = camposEditables.some(
      (campo) => this.formSucursal.get(campo)?.value === ''
    );
    const camposConDatos = camposEditables.some(
      (campo) => this.formSucursal.get(campo)?.value !== ''
    );

    return camposConDatos && camposVacios ? false : true;
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
