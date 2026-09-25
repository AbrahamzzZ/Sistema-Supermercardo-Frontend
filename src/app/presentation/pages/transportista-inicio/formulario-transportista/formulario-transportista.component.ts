import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { Metodos } from '../../../../shared/utility/metodos';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ESPACIO_FIJO_ERRORES } from '../../../../shared/ui/form-field-options';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-formulario-transportista',
  imports: [MaterialModule, FormField],
  providers: [ESPACIO_FIJO_ERRORES],
  templateUrl: './formulario-transportista.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-transportista.component.scss'
})
export class FormularioTransportistaComponent implements OnInit, CanComponentDeactive {
  private readonly idTransportista = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idTransportista() > 0);

  private readonly route = inject(ActivatedRoute);
  private readonly transportistaServicio = inject(TransportistaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  public imagenURL: string | null = null;

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

  // Valores con los que se inició el formulario (vacíos al registrar, los del transportista al editar).
  private valoresIniciales = this.transportistaModel();

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

  private tieneCambioSinGuardar(): boolean {
    const actual = this.transportistaModel();
    const inicial = this.valoresIniciales;
    return actual.nombres !== inicial.nombres
      || actual.apellidos !== inicial.apellidos
      || actual.cedula !== inicial.cedula
      || actual.telefono !== inicial.telefono
      || actual.correo_Electronico !== inicial.correo_Electronico
      || actual.imagenBase64 !== inicial.imagenBase64
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
      this.idTransportista.set(id);
      this.cargarTransportista();
    }
  }

  private cargarTransportista(): void {
    this.transportistaServicio.obtener(this.idTransportista()).subscribe({
      next: (resp: any) => {
        if (resp?.data) {
          const imagen = resp.data.imagen ?? resp.data.foto;
          const tieneImagen = !!imagen && typeof imagen === 'string';

          this.transportistaModel.set({
            codigo: resp.data.codigo,
            nombres: resp.data.nombres,
            apellidos: resp.data.apellidos,
            cedula: resp.data.cedula,
            telefono: resp.data.telefono,
            correo_Electronico: resp.data.correo_Electronico,
            imagenBase64: tieneImagen ? imagen : '',
            estado: resp.data.estado
          });

          this.imagenURL = tieneImagen
            ? Metodos.base64AImagen(imagen)
            : '../assets/images/default-avatar.jpg'; // Imagen por defecto

          this.valoresIniciales = this.transportistaModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del transportista.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.transportistaForm, async (form) => {
      const valores = form().value();
      const transportista: ITransportista = {
        id_Transportista: this.idTransportista(),
        codigo: valores.codigo,
        nombres: valores.nombres.trim(),
        apellidos: valores.apellidos.trim(),
        cedula: valores.cedula.trim(),
        telefono: valores.telefono.trim(),
        correo_Electronico: valores.correo_Electronico.trimEnd(),
        imagenBase64: valores.imagenBase64.trim(),
        estado: valores.estado,
        // El formulario de edición anterior enviaba 'foto' vacío.
        ...(this.esEdicion() ? { foto: '' } : {})
      };

      const peticion = this.esEdicion()
        ? this.transportistaServicio.editar(transportista)
        : this.transportistaServicio.registrar(transportista);
      const accion = this.esEdicion() ? 'editado' : 'registrado';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/transportista'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Transportista ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar el Transportista' : 'Error al registrar el Transportista', 'error');
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
