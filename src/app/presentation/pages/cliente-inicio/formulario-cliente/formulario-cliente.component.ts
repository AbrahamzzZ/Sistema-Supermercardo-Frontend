import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICliente } from '../../../../core/interfaces/cliente';
import { Metodos } from '../../../../shared/utility/metodos';
import { ClienteService } from '../../../../core/services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ERRORES_DINAMICOS } from '../../../../shared/ui/form-field-options';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { Validaciones } from '../../../../shared/utility/validaciones';

@Component({
  selector: 'app-formulario-cliente',
  imports: [MaterialModule, FormField],
  providers: [ERRORES_DINAMICOS],
  templateUrl: './formulario-cliente.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-cliente.component.scss'
})
export class FormularioClienteComponent implements OnInit, CanComponentDeactive {
  private readonly idCliente = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idCliente() > 0);

  private readonly route = inject(ActivatedRoute);
  private readonly clienteServicio = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly clienteModel = signal({
    codigo: Metodos.generarCodigo(),
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    correo_Electronico: ''
  });

  // Valores con los que se inició el formulario (vacíos al registrar, los del cliente al editar).
  private valoresIniciales = this.clienteModel();

  protected readonly clienteForm = form(this.clienteModel, (schema) => {
    required(schema.nombres, {message: 'Ingrese un nombre.'});
    minLength(schema.nombres, 3, {message: 'Nombres demasiado cortos.'});
    maxLength(schema.nombres, 30, {message: 'Nombres demasiado largos.'});
    required(schema.apellidos, {message: 'Ingrese sus apellidos.'});
    minLength(schema.apellidos, 3, {message: 'Nombres demasiado cortos.'});
    maxLength(schema.apellidos, 30, {message: 'Nombres demasiado largos.'});
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
    const actual = this.clienteModel();
    const inicial = this.valoresIniciales;
    return actual.nombres !== inicial.nombres
      || actual.apellidos !== inicial.apellidos
      || actual.cedula !== inicial.cedula
      || actual.telefono !== inicial.telefono
      || actual.correo_Electronico !== inicial.correo_Electronico;
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
      this.idCliente.set(id);
      this.cargarCliente();
    }
  }

  private cargarCliente(): void {
    this.clienteServicio.obtener(this.idCliente()).subscribe({
      next: (resp) => {
        if (resp.data) {
          this.clienteModel.set({
            codigo: resp.data.codigo,
            nombres: resp.data.nombres,
            apellidos: resp.data.apellidos,
            cedula: resp.data.cedula,
            telefono: resp.data.telefono,
            correo_Electronico: resp.data.correo_Electronico
          });
          this.valoresIniciales = this.clienteModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del cliente.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.clienteForm, async (form) => {
      const valores = form().value();
      const cliente: ICliente = {
        id_Cliente: this.idCliente(),
        codigo: valores.codigo,
        nombres: valores.nombres.trim(),
        apellidos: valores.apellidos.trim(),
        cedula: valores.cedula.trim(),
        telefono: valores.telefono.trim(),
        correo_Electronico: valores.correo_Electronico.trim()
      };

      const peticion = this.esEdicion()
        ? this.clienteServicio.editar(cliente)
        : this.clienteServicio.registrar(cliente);
      const accion = this.esEdicion() ? 'editado' : 'registrado';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/cliente'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Cliente ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar el Cliente' : 'Error al registrar el Cliente', 'error');
        },
        complete: () => this.guardando.set(false)
      });
    });
  }

  regresar() {
    this.router.navigate(['/cliente']);
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
