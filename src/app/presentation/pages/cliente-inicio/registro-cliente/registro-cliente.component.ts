import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICliente } from '../../../../core/interfaces/cliente';
import { Metodos } from '../../../../shared/utility/metodos';
import { ClienteService } from '../../../../core/services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { Validaciones } from '../../../../shared/utility/validaciones';

@Component({
  selector: 'app-cliente',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-cliente.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-cliente.component.scss'
})
export class RegistroClienteComponent implements OnInit, CanComponentDeactive {
  private readonly idCliente = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);

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

  private tieneCambioSinGuardar() : boolean {
    return this.clienteModel().nombres !== '' || this.clienteModel().apellidos != '' || this.clienteModel().cedula != '' || this.clienteModel().telefono != '' || this.clienteModel().correo_Electronico != '';
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
      this.idCliente.set(Number.parseInt(this.route.snapshot.params['id']));
    }
  }

  async registrarCliente() {
    await submit(this.clienteForm, async (form) => {
      const cliente: ICliente = {
        id_Cliente: this.idCliente() || 0,
        codigo: Metodos.generarCodigo(),
        nombres: form().value().nombres.trim(),
        apellidos: form().value().apellidos.trim(),
        cedula: form().value().cedula.trim(),
        telefono: form().value().telefono.trim(),
        correo_Electronico: form().value().correo_Electronico.trim()
      };

      this.guardando.set(true);

      this.clienteServicio.registrar(cliente).subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/cliente'], { skipLocationChange: true });
            this.mostrarMensaje('¡Cliente registrado exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar el Cliente', 'error');
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