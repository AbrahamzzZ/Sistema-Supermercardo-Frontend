import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { Metodos } from '../../../../shared/utility/metodos';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-transportista',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-transportista.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-transportista.component.scss'
})
export class RegistroTransportistaComponent implements OnInit, CanComponentDeactive {
  private readonly idTransportista = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  private readonly guardando = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly transportistaServicio = inject(TransportistaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  public imagenURL: string | ArrayBuffer | null = null;

  protected readonly transportistaModel = signal({
    codigo: Metodos.generarCodigo(),
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    correo_Electronico: '',
    imagenBase64: '',
    estado: false
  });

  protected readonly transportistaForm = form(this.transportistaModel, (schema) => {
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
    required(schema.imagenBase64, {message: 'Es obligatorio subir una foto del transportista.'});
    maxLength(schema.correo_Electronico, 50, {message: 'El correo electrónico es demasiado largo.'});
    email(schema.correo_Electronico, {message: 'Ingrese un correo valido'});
    Validaciones.soloLetrasSignal(schema.nombres);
    Validaciones.soloLetrasSignal(schema.apellidos);
    Validaciones.soloNumerosSignal(schema.cedula, 10);
    Validaciones.soloNumerosSignal(schema.telefono, 10);
  });

  private tieneCambioSinGuardar() : boolean {
    return this.transportistaModel().nombres !== '' || this.transportistaModel().apellidos != '' || this.transportistaModel().cedula != '' || this.transportistaModel().telefono != '' || this.transportistaModel().correo_Electronico != '';
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
      this.idTransportista.set(Number.parseInt(this.route.snapshot.params['id']));
    }
  }

  async registrarTransportista() {
    await submit(this.transportistaForm, async (form) => {
      const transportista: ITransportista = {
        id_Transportista: this.idTransportista() || 0,
        codigo: Metodos.generarCodigo(),
        nombres: form().value().nombres.trim(),
        apellidos: form().value().apellidos.trim(),
        cedula: form().value().cedula.trim(),
        telefono: form().value().telefono.trim(),
        correo_Electronico: form().value().correo_Electronico.trimEnd(),
        imagenBase64: form().value().imagenBase64.trim(),
        estado: form().value().estado
      }
      
      this.guardando.set(true);

      this.transportistaServicio.registrar(transportista).subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/transportista'], { skipLocationChange: true });
            this.mostrarMensaje('¡Transportista registrado exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar el Transportista', 'error');
        },
        complete: () => this.guardando.set(false)
      });
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

        const imagenBase64 = this.imagenURL?.split(',')[1] ?? '';
        this.transportistaModel.update((modelo) => ({ ...modelo, imagenBase64 }));
      };

      reader.readAsDataURL(file); // Convierte la imagen a Base64
    }
  }

  eliminarImagen(): void {
    this.transportistaModel.update((modelo) => ({ ...modelo, imagenBase64: '' }));
    this.imagenURL = '';
  }

  canDeactive(): boolean | Observable<boolean> {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
