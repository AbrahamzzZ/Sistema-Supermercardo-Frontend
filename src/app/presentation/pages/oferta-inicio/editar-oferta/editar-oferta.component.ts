import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService } from '../../../../core/services/producto.service';
import { OfertaService } from '../../../../core/services/oferta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IProducto } from '../../../../core/interfaces/producto';
import { Metodos } from '../../../../shared/utility/metodos';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { IOferta } from '../../../../core/interfaces/oferta';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-editar-oferta',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './editar-oferta.component.html',
  styleUrl: './editar-oferta.component.scss'
})
export class EditarOfertaComponent implements OnInit {
  idOferta!: number;
  private activatedRoute = inject(ActivatedRoute);
  private ofertaServicio = inject(OfertaService);
  private productoServicio = inject(ProductoService);
  public productos: IProducto[] = [];
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  public oferta!: IOferta;

  public formOferta = this.formBuilder.nonNullable.group({
    codigo: [Metodos.generarCodigo()],
    nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
    producto: [0, [Validators.required, Validaciones.productoRequerido()]],
    descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
    fechaInicio: [new Date(), [Validators.required]],
    fechaFin: [new Date(), [Validators.required, Validaciones.fechaFinValida(new Date())]],
    descuento: [0, [Validators.required, Validators.max(100), Validators.min(1)]],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombre', 'descripcion'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formOferta.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idOferta = +params['id'];
      if (this.idOferta) {
        this.cargarProductos();
        this.cargarOferta();
      }
    });
  }

  cargarOferta(): void {
    this.ofertaServicio.obtener(this.idOferta).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formOferta.patchValue({
            nombre: resp.data.nombre_Oferta,
            producto: resp.data.id_Producto,
            descripcion: resp.data.descripcion,
            fechaInicio: resp.data.fecha_Inicio ? new Date(resp.data.fecha_Inicio) : undefined,
            fechaFin: resp.data.fecha_Fin ? new Date(resp.data.fecha_Fin) : undefined,
            descuento: resp.data.descuento,
            estado: resp.data.estado
          });
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación de la oferta.');
        console.error(err);
      }
    });
  }

  cargarProductos(): void {
    this.productoServicio.lista().subscribe({
      next: (resp: any) => {
        this.productos = resp.data;
      },
      error: (err) => {
        this.mostrarMensaje('Error al obtener el producto.');
        console.error(err);
      }
    });
  }

  editarOferta(): void {
    const productoId = this.formOferta.value.producto;

    const oferta: Partial<IOferta> = {
      id_Oferta: this.idOferta,
      nombre_Oferta: this.formOferta.value.nombre!,
      id_Producto: productoId,
      descripcion: this.formOferta.value.descripcion!,
      fecha_Inicio: this.formOferta.value.fechaInicio
        ? this.formOferta.value.fechaInicio.toISOString().split('T')[0]
        : '',
      fecha_Fin: this.formOferta.value.fechaFin
        ? this.formOferta.value.fechaFin.toISOString().split('T')[0]
        : '',
      descuento: this.formOferta.value.descuento!,
      estado: this.formOferta.value.estado
    };

    this.formOferta.markAllAsTouched();

    if (!this.formOferta.valid) {
      this.mostrarMensaje('Formulatio inválido', 'error');
      return;
    }

    this.ofertaServicio.editar(oferta).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/oferta']);
          this.mostrarMensaje('¡Oferta editado exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar la Oferta', 'error');
      }
    });
  }

  regresar() {
    this.router.navigate(['/oferta']);
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

  productoSeleccionado(event: MatSelectChange) {
    const productoId = event.value;
    this.formOferta.controls.producto.setValue(productoId);
  }

  get nombreField(): FormControl<string> {
    return this.formOferta.controls.nombre;
  }

  get descripcionField(): FormControl<string> {
    return this.formOferta.controls.descripcion;
  }

  get productoSeleccionadoField(): FormControl<number> {
    return this.formOferta.controls.producto;
  }

  get fechaInicioField(): FormControl<Date> {
    return this.formOferta.controls.fechaInicio;
  }

  get fechaFinField(): FormControl<Date> {
    return this.formOferta.controls.fechaFin;
  }

  get descuentoField(): FormControl<number> {
    return this.formOferta.controls.descuento;
  }
}
