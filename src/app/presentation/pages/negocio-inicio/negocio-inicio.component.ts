import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NegocioService } from '../../../core/services/negocio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { INegocio } from '../../../core/interfaces/negocio';
import { Validaciones } from '../../../shared/utility/validaciones';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-negocio-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
  ],
  templateUrl: './negocio-inicio.component.html',
  styleUrl: './negocio-inicio.component.scss'
})
export class NegocioInicioComponent implements OnInit{
  public idNegocio = 1;
  public negocio!: FormGroup;
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private activatedRoute = inject(ActivatedRoute);
  private negocioServicio = inject(NegocioService);
  private formBuilder = inject(FormBuilder);
  public imagenURL: string | null = null;

  public formNegocio = this.formBuilder.nonNullable.group({
    id: [0],
    nombre: ['', Validators.required],
    telefono: ['', [Validators.required, Validaciones.soloNumeros()]],
    ruc: ['', [Validators.required, Validaciones.rucValido()]],
    direccion: ['', Validators.required],
    correoElectronico: ['', [Validators.required, Validators.email]],
    imageBase64: ['', [Validators.required]],
    imagen: ['']
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idNegocio = 1;
      if (this.idNegocio) {
        this.cargarNegocio();
      }
    });
  }

  cargarNegocio(): void {
    this.negocioServicio.obtener(this.idNegocio).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formNegocio.patchValue({
            id: resp.data.id_Negocio,
            nombre: resp.data.nombre,
            telefono: resp.data.telefono,
            ruc: resp.data.ruc,
            direccion: resp.data.direccion,
            correoElectronico: resp.data.correo_Electronico
          });

          if (resp.data.logo && typeof resp.data.logo === 'string') {
            this.imagenURL = `data:image/*;base64,${resp.data.logo}`;
            this.formNegocio.controls.imageBase64.setValue(resp.data.logo);
          } else {
            this.imagenURL = '../assets/images/default-avatar.jpg'; // Imagen por defecto
          }
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al obtener la información del negocio.');
        console.error(err);
      }
    });
  }

  editarNegocio(): void {
    const imagenOriginal = this.imagenURL?.split(',')[1] ?? '';
    const nuevaImagen = this.formNegocio.value.imageBase64 ?? '';
    const imagenFinal = nuevaImagen || imagenOriginal;

    const negocio: Partial<INegocio> = {
      id_Negocio: this.idNegocio || 0,
      nombre: this.formNegocio.value.nombre?.trim() ?? '',
      telefono: this.formNegocio.value.telefono ?? '',
      ruc: this.formNegocio.value.ruc ?? '',
      direccion: this.formNegocio.value.direccion ?? '',
      correo_Electronico: this.formNegocio.value.correoElectronico?.trim() ?? '',
      logo: this.formNegocio.value.imagen ?? '',
      imagenBase64: imagenFinal
    };

    this.formNegocio.markAllAsTouched();

    if (!this.formNegocio.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.negocioServicio.editar(negocio).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/negocio/1']);
          this.mostrarMensaje('¡Información del Negocio fue editada exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar la información del Negocio', 'error');
      }
    });
  }

  subirImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imagenURL = reader.result as string; // Vista previa de la imagen

        this.formNegocio.controls.imageBase64.setValue(this.imagenURL?.split(',')[1]); // Guardar solo la parte Base64
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

  verEstadistica() {
    this.router.navigate(['/negocio/1/estadistica']);
  }

  regresar() {
    this.router.navigate(['/home']);
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

  get nombreField(): FormControl<string> {
    return this.formNegocio.controls.nombre;
  }

  get telefonoField(): FormControl<string> {
    return this.formNegocio.controls.telefono;
  }

  get rucField(): FormControl<string> {
    return this.formNegocio.controls.ruc;
  }

  get direccionField(): FormControl<string> {
    return this.formNegocio.controls.direccion;
  }

  get correoElectronicoField(): FormControl<string> {
    return this.formNegocio.controls.correoElectronico;
  }

  get imagenBase64Field(): FormControl<string> {
    return this.formNegocio.controls.imageBase64;
  }
}
