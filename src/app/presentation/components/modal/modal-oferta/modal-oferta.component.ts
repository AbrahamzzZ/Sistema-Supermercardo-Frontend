import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource} from '@angular/material/table';
import { IOferta } from '../../../../core/interfaces/oferta';
import { OfertaService } from '../../../../core/services/oferta.service';
import { NgClass } from '@angular/common';
import { IOfertaProducto } from '../../../../core/interfaces/Dto/ioferta-producto';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-modal-oferta',
  standalone: true,
  imports: [
    NgClass,
    MaterialModule
  ],
  templateUrl: './modal-oferta.component.html',
  styleUrl: './modal-oferta.component.scss'
})
export class ModalOfertaComponent {
  private readonly ofertaService = inject(OfertaService);
  private readonly dialogRef = inject(MatDialogRef<ModalOfertaComponent>);
  dataSource = new MatTableDataSource<IOfertaProducto>([]);
  columnas: string[] = ['id', 'codigo', 'nombre', 'producto', 'estado', 'accion'];
  filtro = '';

  constructor(
  ) {
    this.obtenerOfertas();
  }

  obtenerOfertas() {
    this.ofertaService.lista().subscribe({
      next: (resp: any) => {
        this.dataSource.data = resp.data;

        this.dataSource.filterPredicate = (data: IOfertaProducto, filter: string) => {
          const termino = filter.trim().toLowerCase();
          return (
            data.nombre_Oferta.toLowerCase().includes(termino) ||
            data.nombre_Producto.toLowerCase().includes(termino) ||
            data.codigo.toLowerCase().includes(termino)
          );
        };
      },
      error: (e) => console.error(e)
    });
  }

  aplicarFiltro(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filtro = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  limpiarFiltro(input: HTMLInputElement) {
    input.value = '';
    this.filtro = '';
    this.dataSource.filter = '';
  }

  seleccionarOferta(oferta: IOferta) {
    this.dialogRef.close(oferta);
  }

  cerrar() {
    this.dialogRef.close();
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }
}
