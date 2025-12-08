import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { Metodos } from '../../../../shared/utility/metodos';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-editar-transportista',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './editar-transportista.component.html',
  styleUrl: './editar-transportista.component.scss'
})
export class EditarTransportistaComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly transportistaServicio = inject(TransportistaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private idTransportista!: number;
  public imagenURL: string | null = null;

  public formTransportista = this.formBuilder.nonNullable.group({
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
    this.activatedRoute.params.subscribe((params) => {
      this.idTransportista = +params['id'];
      if (this.idTransportista) {
        this.cargarTransportista();
      }
    });
  }

  cargarTransportista(): void {
    this.transportistaServicio.obtener(this.idTransportista).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formTransportista.patchValue({
            nombres: resp.data.nombres,
            apellidos: resp.data.apellidos,
            cedula: resp.data.cedula,
            telefono: resp.data.telefono,
            correoElectronico: resp.data.correo_Electronico,
            estado: resp.data.estado
          });

          if (resp.data.imagen && typeof resp.data.imagen === 'string') {
            this.imagenURL = `data:image/*;base64,${resp.data.imagen}`;
            this.formTransportista.controls.imageBase64.setValue(resp.data.imagen);
          } else {
            this.imagenURL = '../assets/images/default-avatar.jpg'; // Imagen por defecto
          }
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del transportista.');
        console.error(err);
      }
    });
  }

  editarTransportista(): void {
    const imagenOriginal = this.imagenURL?.split(',')[1] ?? '';
    const nuevaImagen = this.formTransportista.value.imageBase64 ?? '';
    const imagenFinal = nuevaImagen || imagenOriginal;

    const transportista: Partial<ITransportista> = {
      id_Transportista: this.idTransportista || 0,
      codigo: Metodos.generarCodigo(),
      nombres: this.formTransportista.value.nombres?.trim() ?? '',
      apellidos: this.formTransportista.value.apellidos?.trim() ?? '',
      cedula: this.formTransportista.value.cedula ?? '',
      telefono: this.formTransportista.value.telefono ?? '',
      correo_Electronico: this.formTransportista.value.correoElectronico?.trim() ?? '',
      imagen: this.formTransportista.value.imagen ?? '',
      imagenBase64: imagenFinal,
      estado: this.formTransportista.value.estado ?? false
    };

    this.formTransportista.markAllAsTouched();

    if (!this.formTransportista.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.transportistaServicio.editar(transportista).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/transportista']);
          this.mostrarMensaje('¡Transportista editado exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar el Transportista', 'error');
      }
    });
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

  regresar() {
    this.router.navigate(['/transportista']);
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
