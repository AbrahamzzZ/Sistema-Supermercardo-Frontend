import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../../core/interfaces/proveedor';
import { Metodos } from '../../../../shared/utility/metodos';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ESPACIO_FIJO_ERRORES } from '../../../../shared/ui/form-field-options';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-formulario-proveedor',
  imports: [MaterialModule, FormField],
  providers: [ESPACIO_FIJO_ERRORES],
  templateUrl: './formulario-proveedor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-proveedor.component.scss'
})
export class FormularioProveedorComponent implements OnInit, CanComponentDeactive {
  private readonly idProveedor = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idProveedor() > 0);

  private readonly route = inject(ActivatedRoute);
  private readonly proveedorServicio = inject(ProveedorService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly proveedorModel = signal({
    codigo: Metodos.generarCodigo(),
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    correo_Electronico: '',
    estado: false
  });

  // Valores con los que se inició el formulario (vacíos al registrar, los del proveedor al editar).
  private valoresIniciales = this.proveedorModel();

  protected readonly proveedorForm = form(this.proveedorModel, (schema) => {
    required(schema.nombres, {message: 'Ingrese un nombre.'});
    minLength(schema.nombres, 3, {message: 'Nombres demasiado cortos.'});
    maxLength(schema.nombres, 30, {message: 'Nombres demasiado largos.'});
    required(schema.apellidos, {message: 'Ingrese sus apellidos.'});
    minLength(schema.apellidos, 3, {message: 'Apellidos demasiado cortos.'});
    maxLength(schema.apellidos, 30, {message: 'Apellidos demasiado largos.'});
    required(schema.cedula, {message: 'Ingrese su cédula.'});
    maxLength(schema.cedula, 10, {message: 'La cédula debe tener 10 dígitos.'});
    required(schema.telefono, {message: 'Ingrese su teléfono.'});
    maxLength(schema.telefono, 10, {message: 'El teléfono debe tener 10 dígitos.'});
    required(schema.correo_Electronico, {message: 'Ingrese su correo electrónico.'});
    maxLength(schema.correo_Electronico, 50, {message: 'El correo electrónico es demasiado largo.'});
    email(schema.correo_Electronico, {message: 'Ingrese un correo valido'});
    Validaciones.soloLetrasSignal(schema.nombres);
    Validaciones.soloLetrasSignal(schema.apellidos);
    Validaciones.soloNumerosSignal(schema.cedula, 10);
    Validaciones.soloNumerosSignal(schema.telefono, 10);
  });

  private tieneCambioSinGuardar(): boolean {
    const actual = this.proveedorModel();
    const inicial = this.valoresIniciales;
    return actual.nombres !== inicial.nombres
      || actual.apellidos !== inicial.apellidos
      || actual.cedula !== inicial.cedula
      || actual.telefono !== inicial.telefono
      || actual.correo_Electronico !== inicial.correo_Electronico
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
      this.idProveedor.set(id);
      this.cargarProveedor();
    }
  }

  private cargarProveedor(): void {
    this.proveedorServicio.obtener(this.idProveedor()).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.proveedorModel.set({
            codigo: resp.data.codigo,
            nombres: resp.data.nombres,
            apellidos: resp.data.apellidos,
            cedula: resp.data.cedula,
            telefono: resp.data.telefono,
            correo_Electronico: resp.data.correo_Electronico,
            estado: resp.data.estado
          });
          this.valoresIniciales = this.proveedorModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del proveedor.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.proveedorForm, async (form) => {
      const valores = form().value();
      const proveedor: IProveedor = {
        id_Proveedor: this.idProveedor(),
        codigo: valores.codigo,
        nombres: valores.nombres.trim(),
        apellidos: valores.apellidos.trim(),
        cedula: valores.cedula.trim(),
        telefono: valores.telefono.trim(),
        correo_Electronico: valores.correo_Electronico.trimEnd(),
        estado: valores.estado
      };

      const peticion = this.esEdicion()
        ? this.proveedorServicio.editar(proveedor)
        : this.proveedorServicio.registrar(proveedor);
      const accion = this.esEdicion() ? 'editado' : 'registrado';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/proveedor'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Proveedor ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar el proveedor' : 'Error al registrar el proveedor', 'error');
        },
        complete: () => this.guardando.set(false)
      });
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
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
