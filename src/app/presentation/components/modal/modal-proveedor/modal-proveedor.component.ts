import { Component, inject } from '@angular/core';
import { IProveedor } from '../../../../core/interfaces/proveedor';
import { MatDialogRef } from '@angular/material/dialog';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { MatTableDataSource } from '@angular/material/table';
import { NgClass } from '@angular/common';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-modal-proveedor',
  standalone: true,
  imports: [
    NgClass,
    MaterialModule
  ],
  templateUrl: './modal-proveedor.component.html',
  styleUrl: './modal-proveedor.component.scss'
})
export class ModalProveedorComponent {
  private readonly proveedorService = inject(ProveedorService);
  private readonly dialogRef = inject(MatDialogRef<ModalProveedorComponent>);
  dataSource = new MatTableDataSource<IProveedor>([]);
  columnas: string[] = ['id', 'nombres', 'apellidos', 'cedula', 'estado', 'accion'];
  filtro = '';

  constructor(
  ) {
    this.obtenerProveedores();
  }

  obtenerProveedores() {
    this.proveedorService.lista().subscribe({
      next: (resp: any) => {
        this.dataSource.data = resp.data;

        this.dataSource.filterPredicate = (data: IProveedor, filter: string) => {
          const termino = filter.trim().toLowerCase();
          return (
            data.nombres.toLowerCase().includes(termino) ||
            data.apellidos.toLowerCase().includes(termino) ||
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

  seleccionarProveedor(proveedor: IProveedor) {
    this.dialogRef.close(proveedor);
  }

  cerrar() {
    this.dialogRef.close();
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }
}
