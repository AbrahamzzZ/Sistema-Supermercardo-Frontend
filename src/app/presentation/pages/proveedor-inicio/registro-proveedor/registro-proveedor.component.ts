import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../../core/interfaces/proveedor';
import { Metodos } from '../../../../shared/utility/metodos';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-proveedor',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-proveedor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-proveedor.component.scss'
})
export class RegistroProveedorComponent implements OnInit, CanComponentDeactive {
  private readonly idProveedor = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  
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

  protected readonly proveedorForm = form(this.proveedorModel, (schema) => {
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
    return this.proveedorModel().nombres != '' || this.proveedorModel().apellidos != '' || this.proveedorModel().cedula != '' || this.proveedorModel().telefono != '' || this.proveedorModel().correo_Electronico != '';
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
      this.idProveedor.set(Number.parseInt(this.route.snapshot.params['id']));
    }
  }

  async registrarProveedor() {
    await submit(this.proveedorForm, async (form) =>{
      const proveedor: IProveedor = {
        id_Proveedor: this.idProveedor() || 0,
        codigo: Metodos.generarCodigo(),
        nombres: form().value().nombres.trim(),
        apellidos: form().value().apellidos.trim(),
        cedula: form().value().cedula.trim(),
        telefono: form().value().telefono.trim(),
        correo_Electronico: form().value().correo_Electronico.trimEnd(),
        estado: false
      };

      this.guardando.set(true);

      this.proveedorServicio.registrar(proveedor).subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/proveedor'], { skipLocationChange: true });
            this.mostrarMensaje('¡Proveedor registrado exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar el proveedor', 'error');
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