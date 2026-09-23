import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { Metodos } from '../../../../shared/utility/metodos';
import { ISucursal } from '../../../../core/interfaces/sucursal';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { INegocio } from '../../../../core/interfaces/negocio';
import { NegocioService } from '../../../../core/services/negocio.service';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-registrar-sucursal',
  imports: [MaterialModule, FormField],
  templateUrl: './registrar-sucursal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registrar-sucursal.component.scss'
})
export class RegistrarSucursalComponent implements OnInit, CanComponentDeactive {
  private readonly idSucursal = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly sucursalServicio = inject(SucursalService);
  private readonly negocioServicio = inject(NegocioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  public negocio!: INegocio;

  protected readonly sucursalModel = signal({
    codigo: Metodos.generarCodigo(),
    nombre: '',
    direccion: '',
    latitud: '',
    longitud: '',
    ciudad: '',
    id_Negocio: 0,
    estado: false
  });

  protected readonly sucursalForm = form(this.sucursalModel, (schema) => {
    required(schema.nombre, {message: 'Ingrese un nombre.'});
    required(schema.direccion, {message: 'Ingrese una dirección.'});
    required(schema.ciudad, {message: 'Ingrese una ciudad.'});
    required(schema.latitud, {message: 'Ingrese una latitud.'});
    required(schema.longitud, {message: 'Ingrese una longitud.'});
    maxLength(schema.nombre, 30, {message: 'Nombre demasiado largo.'});
    maxLength(schema.direccion, 90, {message: 'La dirección es demasiado larga.'});
    maxLength(schema.ciudad, 90, {message: 'La ciudad es demasiado larga.'});
    Validaciones.soloLetrasSignal(schema.ciudad);
    Validaciones.coordenadaValidaSignal(schema.latitud, 'latitud');
    Validaciones.coordenadaValidaSignal(schema.longitud, 'longitud');
  });

  private tieneCambioSinGuardar() : boolean {
    return this.sucursalModel().nombre !== '' || this.sucursalModel().direccion !== '' || this.sucursalModel().latitud !== '' || this.sucursalModel().longitud !== '' || this.sucursalModel().ciudad !== '';
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
      this.idSucursal.set(Number.parseInt(this.route.snapshot.params['id']));
    }

    this.negocioServicio.obtener(1).subscribe({
      next: (resp: any) => {
        this.negocio = resp.data;
      },
      error: () => {
        this.mostrarMensaje('Error al obtener la información del negocio', 'error');
      }
    });
  }

  async registrarSucursal() {
    await submit(this.sucursalForm, async (form) =>{
      const sucursal: ISucursal = {
        id_Sucursal: this.idSucursal() || 0,
        id_Negocio: this.negocio.id_Negocio,
        codigo: Metodos.generarCodigo(),
        nombre_Sucursal: form().value().nombre.trim(),
        direccion_Sucursal: form().value().direccion.trim(),
        latitud: Number(form().value().latitud),
        longitud: Number(form().value().longitud),
        ciudad_Sucursal: form().value().ciudad.trim(),
        estado: form().value().estado
      };

      this.guardando.set(true);

      this.sucursalServicio.registrar(sucursal).subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/sucursal'], { skipLocationChange: true });
            this.mostrarMensaje('¡Sucursal registrada exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar la sucursal', 'error');
        },
        complete: () => this.guardando.set(false)
      });
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

  canDeactive(): boolean {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
