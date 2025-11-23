import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IProducto } from '../../../../core/interfaces/producto';
import { Metodos } from '../../../../shared/utility/metodos';
import { ProductoService } from '../../../../core/services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ICategoria } from '../../../../core/interfaces/categoria';
import { MatSelectChange } from '@angular/material/select';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './registro-producto.component.html',
  styleUrl: './registro-producto.component.scss'
})
export class RegistroProductoComponent implements OnInit, CanComponentDeactive {
  private idProducto!: number;
  private route = inject(ActivatedRoute);
  private productoServicio = inject(ProductoService);
  private categoriaServicio = inject(CategoriaService);
  public categorias: ICategoria[] = [];
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public formProducto = this.formBuilder.nonNullable.group({
    codigo: [Metodos.generarCodigo()],
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(30),
        Validaciones.soloLetras()
      ]
    ],
    descripcion: ['', [Validators.required, Validators.maxLength(50)]],
    categoria: [0, [Validators.required, Validaciones.categoriaRequerida()]],
    paisOrigen: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validaciones.soloLetras()
      ]
    ],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombre', 'descripcion', 'categoria', 'paisOrigen'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formProducto.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idProducto = parseInt(this.route.snapshot.params['id']);
    }

    this.categoriaServicio.lista().subscribe({
      next: (resp: any) => {
        this.categorias = resp.data;
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      }
    });
  }

  registrarProducto() {
    const categoriaId = this.formProducto.value.categoria;

    const producto: IProducto = {
      id_Producto: this.idProducto || 0,
      codigo: Metodos.generarCodigo(),
      nombre_Producto: this.formProducto.value.nombre?.trim() ?? '',
      descripcion: this.formProducto.value.descripcion?.trim() ?? '',
      id_Categoria: categoriaId ?? 0,
      pais_Origen: this.formProducto.value.paisOrigen?.trim() ?? '',
      estado: this.formProducto.value.estado ?? false
    };

    this.formProducto.markAllAsTouched();

    if (!this.formProducto.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.productoServicio.registrar(producto).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/producto'], { skipLocationChange: true });
          this.mostrarMensaje('¡Producto registrado exitosamente!', 'success');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error 400:', err.error);
        if (err.error?.errors) {
          Object.entries(err.error.errors).forEach(([campo, errores]) => {
            console.log(`Error en ${campo}:`, errores);
          });
          this.mostrarMensaje('Error al registrar el Producto', 'error');
        }
      }
    });
  }

  regresar() {
    this.router.navigate(['/producto']);
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
    const camposEditables = ['nombre', 'descripcion', 'paisOrigen'];
    const camposVacios = camposEditables.some(
      (campo) => this.formProducto.get(campo)?.value === ''
    );
    const camposConDatos = camposEditables.some(
      (campo) => this.formProducto.get(campo)?.value !== ''
    );

    return camposConDatos && camposVacios ? false : true;
  }

  categoriaSeleccionada(event: MatSelectChange) {
    const categoriaId = event.value;
    this.formProducto.controls.categoria.setValue(categoriaId);
  }

  get nombreField(): FormControl<string> {
    return this.formProducto.controls.nombre;
  }

  get descripcionField(): FormControl<string> {
    return this.formProducto.controls.descripcion;
  }

  get categoriaSeleccionadaField(): FormControl<number> {
    return this.formProducto.controls.categoria;
  }

  get paisOrigenField(): FormControl<string> {
    return this.formProducto.controls.paisOrigen;
  }
}
