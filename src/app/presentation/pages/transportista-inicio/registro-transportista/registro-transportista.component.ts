import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { Metodos } from '../../../../shared/utility/metodos';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-transportista',
  standalone: true,
  imports: [
    MaterialModule,
    NgIf
  ],
  templateUrl: './registro-transportista.component.html',
  styleUrl: './registro-transportista.component.scss'
})
export class RegistroTransportistaComponent implements OnInit, CanComponentDeactive {
  private idTransportista!: number;
  private route = inject(ActivatedRoute);
  private transportistaServicio = inject(TransportistaService);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  public imagenURL: string | ArrayBuffer | null = null;

  public formTransportista = this.formBuilder.nonNullable.group({
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
    imageBase64: ['', [Validators.required]],
    imagen: [''],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombres', 'apellidos', 'cedula', 'telefono', 'correoElectronico'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formTransportista.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idTransportista = parseInt(this.route.snapshot.params['id']);
    }
  }

  registrarTransportista() {
    const transportista: ITransportista = {
      id_Transportista: this.idTransportista || 0,
      codigo: Metodos.generarCodigo(),
      nombres: this.formTransportista.value.nombres?.trim() ?? '',
      apellidos: this.formTransportista.value.apellidos?.trim() ?? '',
      cedula: this.formTransportista.value.cedula ?? '',
      telefono: this.formTransportista.value.telefono ?? '',
      correo_Electronico: this.formTransportista.value.correoElectronico?.trim() ?? '',
      imagen: this.formTransportista.value.imagen ?? '',
      imagenBase64: this.formTransportista.value.imageBase64 ?? '',
      estado: this.formTransportista.value.estado ?? false,
      fecha_Registro: Metodos.getFechaCreacion()
    };

    this.formTransportista.markAllAsTouched();

    if (!this.formTransportista.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.transportistaServicio.registrar(transportista).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/transportista'], { skipLocationChange: true });
          this.mostrarMensaje('¡Transportista registrado exitosamente!', 'success');
        }
        console.log(data);
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error 400:', err.error);
        if (err.error?.errors) {
          Object.entries(err.error.errors).forEach(([campo, errores]) => {
            console.log(`Error en ${campo}:`, errores);
          });
          this.mostrarMensaje('Error al registrar el Transportista', 'error');
        }
      }
    });
  }

  regresar() {
    this.router.navigate(['/transportista']);
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

  subirImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagenURL = reader.result as string; // Vista previa de la imagen

        this.formTransportista.controls.imageBase64.setValue(this.imagenURL?.split(',')[1]); // Guardar solo la parte Base64
        this.imagenBase64Field.markAsTouched();
      };

      reader.readAsDataURL(file); // Convierte la imagen a Base64
    }
  }

  eliminarImagen(): void {
    this.imagenBase64Field.setValue('');
    this.imagenBase64Field.markAsUntouched();
    this.imagenURL = '';
  }

  canDeactive(): boolean | Observable<boolean> {
    const camposEditables = ['nombres', 'apellidos', 'cedula', 'telefono', 'correoElectronico'];
    const camposVacios = camposEditables.some(
      (campo) => this.formTransportista.get(campo)?.value === ''
    );
    const camposConDatos = camposEditables.some(
      (campo) => this.formTransportista.get(campo)?.value !== ''
    );

    return camposConDatos && camposVacios ? false : true;
  }

  get nombresField(): FormControl<string> {
    return this.formTransportista.controls.nombres;
  }

  get apellidosField(): FormControl<string> {
    return this.formTransportista.controls.apellidos;
  }

  get cedulaField(): FormControl<string> {
    return this.formTransportista.controls.cedula;
  }

  get telefonoField(): FormControl<string> {
    return this.formTransportista.controls.telefono;
  }

  get correoElectronicoField(): FormControl<string> {
    return this.formTransportista.controls.correoElectronico;
  }

  get imagenBase64Field(): FormControl<string> {
    return this.formTransportista.controls.imageBase64;
  }
}
