import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductoService } from '../../../../core/services/producto.service';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { IProducto } from '../../../../core/interfaces/producto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ICategoria } from '../../../../core/interfaces/categoria';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-producto-editar',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './producto-editar.component.html',
  styleUrl: './producto-editar.component.scss'
})
export class ProductoEditarComponent implements OnInit {
  private productoServicio = inject(ProductoService);
  private categoriaServicio = inject(CategoriaService);
  public categorias: ICategoria[] = [];
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private formBuild = inject(FormBuilder);
  private router = inject(Router);
  idProducto!: number;

  public formProducto = this.formBuild.nonNullable.group({
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
    this.activatedRoute.params.subscribe((params) => {
      this.idProducto = +params['id'];
      if (this.idProducto) {
        this.cargarCategorias();
        this.cargarProducto();
      }
    });
  }

  cargarProducto(): void {
    this.productoServicio.obtener(this.idProducto).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formProducto.patchValue({
            nombre: resp.data.nombre_Producto,
            descripcion: resp.data.descripcion,
            categoria: resp.data.id_Categoria,
            paisOrigen: resp.data.pais_Origen,
            estado: resp.data.estado
          });
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del producto.');
        console.log(err);
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaServicio.lista().subscribe({
      next: (resp: any) => {
        this.categorias = resp.data;
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar las categorías.');
        console.error(err);
      }
    });
  }

  editarProducto(): void {
    const categoriaId = this.formProducto.value.categoria;

    const producto: Partial<IProducto> = {
      id_Producto: this.idProducto,
      nombre_Producto: this.formProducto.value.nombre!,
      descripcion: this.formProducto.value.descripcion!,
      id_Categoria: categoriaId,
      pais_Origen: this.formProducto.value.paisOrigen!,
      estado: this.formProducto.value.estado
    };

    this.formProducto.markAllAsTouched();

    if (!this.formProducto.valid) {
      this.mostrarMensaje('Formulario inválido.', 'error');
      return;
    }

    this.productoServicio.editar(producto).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/producto']);
          this.mostrarMensaje('¡Producto editado exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar el producto', 'error');
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
