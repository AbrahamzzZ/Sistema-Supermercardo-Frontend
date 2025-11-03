import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { ICliente } from '../../../core/interfaces/cliente';
import { Metodos } from '../../../shared/utility/metodos';
import { HttpErrorResponse } from '@angular/common/http';
import { ClienteService } from '../../../core/services/cliente.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './registro-cliente.component.html',
  styleUrl: './registro-cliente.component.scss'
})
export class RegistroClienteComponent implements OnInit, CanComponentDeactive {
  private idCliente!: number;
  private route = inject(ActivatedRoute);
  private clienteServicio = inject(ClienteService);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public formCliente = this.formBuilder.nonNullable.group({
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
    correoElectronico: ['', [Validators.required, Validators.email, Validators.maxLength(50)]]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombres', 'apellidos', 'cedula', 'telefono', 'correoElectronico'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formCliente.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idCliente = parseInt(this.route.snapshot.params['id']);
    }
  }

  registrarCliente() {
    const cliente: ICliente = {
      id_Cliente: this.idCliente || 0,
      codigo: Metodos.generarCodigo(),
      nombres: this.formCliente.value.nombres?.trim() ?? '',
      apellidos: this.formCliente.value.apellidos?.trim() ?? '',
      cedula: this.formCliente.value.cedula?.trim() ?? '',
      telefono: this.formCliente.value.telefono?.trim() ?? '',
      correo_Electronico: this.formCliente.value.correoElectronico?.trim() ?? '',
      fecha_Registro: Metodos.getFechaCreacion()
    };

    this.formCliente.markAllAsTouched();

    if (!this.formCliente.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.clienteServicio.registrar(cliente).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/cliente'], { skipLocationChange: true });
          this.mostrarMensaje('¡Cliente registrado exitosamente!', 'success');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error 400:', err.error);
        if (err.error?.errors) {
          Object.entries(err.error.errors).forEach(([campo, errores]) => {
            console.log(`Error en ${campo}:`, errores);
          });
          this.mostrarMensaje('Error al registrar el Cliente', 'error');
        }
      }
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
    const camposEditables = ['nombres', 'apellidos', 'cedula', 'telefono', 'correoElectronico'];
    const camposVacios = camposEditables.some((campo) => this.formCliente.get(campo)?.value === '');
    const camposConDatos = camposEditables.some(
      (campo) => this.formCliente.get(campo)?.value !== ''
    );

    return camposConDatos && camposVacios ? false : true;
  }

  get nombresField(): FormControl<string> {
    return this.formCliente.controls.nombres;
  }

  get apellidosField(): FormControl<string> {
    return this.formCliente.controls.apellidos;
  }

  get cedulaField(): FormControl<string> {
    return this.formCliente.controls.cedula;
  }

  get telefonoField(): FormControl<string> {
    return this.formCliente.controls.telefono;
  }

  get correoElectronicoField(): FormControl<string> {
    return this.formCliente.controls.correoElectronico;
  }
}
