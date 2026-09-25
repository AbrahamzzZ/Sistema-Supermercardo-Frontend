import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
import { ESPACIO_FIJO_ERRORES } from '../../../../shared/ui/form-field-options';
import { form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formulario-sucursal',
  imports: [MaterialModule, FormField],
  providers: [ESPACIO_FIJO_ERRORES],
  templateUrl: './formulario-sucursal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-sucursal.component.scss'
})
export class FormularioSucursalComponent implements OnInit, CanComponentDeactive {
  private readonly idSucursal = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idSucursal() > 0);

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

  // Valores con los que se inició el formulario (vacíos al registrar, los de la sucursal al editar).
  private valoresIniciales = this.sucursalModel();

  protected readonly sucursalForm = form(this.sucursalModel, (schema) => {
    required(schema.nombre, {message: 'Ingrese un nombre.'});
    required(schema.direccion, {message: 'Ingrese una dirección.'});
    required(schema.ciudad, {message: 'Ingrese una ciudad.'});
    required(schema.latitud, {message: 'Ingrese una latitud.'});
    required(schema.longitud, {message: 'Ingrese una longitud.'});
    minLength(schema.nombre, 5, {message: 'Nombre demasiado corto.'});
    minLength(schema.direccion, 3, {message: 'Dirección demasiado corta.'});
    minLength(schema.ciudad, 3, {message: 'El nombre de la ciudad es demasiado corto.'});
    maxLength(schema.nombre, 30, {message: 'Nombre demasiado largo.'});
    maxLength(schema.direccion, 90, {message: 'La dirección es demasiado larga.'});
    maxLength(schema.ciudad, 90, {message: 'La ciudad es demasiado larga.'});
    Validaciones.soloLetrasSignal(schema.ciudad);
    Validaciones.coordenadaValidaSignal(schema.latitud, 'latitud');
    Validaciones.coordenadaValidaSignal(schema.longitud, 'longitud');
  });

  private tieneCambioSinGuardar(): boolean {
    const actual = this.sucursalModel();
    const inicial = this.valoresIniciales;
    return actual.nombre !== inicial.nombre
      || actual.direccion !== inicial.direccion
      || actual.latitud !== inicial.latitud
      || actual.longitud !== inicial.longitud
      || actual.ciudad !== inicial.ciudad
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
      this.idSucursal.set(id);
      this.cargarSucursal();
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

  private cargarSucursal(): void {
    this.sucursalServicio.obtener(this.idSucursal()).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.sucursalModel.set({
            codigo: resp.data.codigo,
            nombre: resp.data.nombre_Sucursal,
            direccion: resp.data.direccion_Sucursal,
            latitud: resp.data.latitud.toString(),
            longitud: resp.data.longitud.toString(),
            ciudad: resp.data.ciudad_Sucursal,
            id_Negocio: resp.data.id_Negocio,
            estado: resp.data.estado
          });
          this.valoresIniciales = this.sucursalModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación de la sucursal.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.sucursalForm, async (form) => {
      const valores = form().value();
      const sucursal: ISucursal = {
        id_Sucursal: this.idSucursal(),
        // Al editar se conserva el negocio de la sucursal; al registrar se usa el negocio cargado.
        id_Negocio: valores.id_Negocio || this.negocio?.id_Negocio || 0,
        codigo: valores.codigo,
        nombre_Sucursal: valores.nombre.trim(),
        direccion_Sucursal: valores.direccion.trim(),
        latitud: Number(valores.latitud),
        longitud: Number(valores.longitud),
        ciudad_Sucursal: valores.ciudad.trim(),
        estado: valores.estado
      };

      const peticion = this.esEdicion()
        ? this.sucursalServicio.editar(sucursal)
        : this.sucursalServicio.registrar(sucursal);
      const accion = this.esEdicion() ? 'editada' : 'registrada';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/sucursal'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Sucursal ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar la sucursal' : 'Error al registrar la sucursal', 'error');
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

  canDeactive(): boolean | Observable<boolean> {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
