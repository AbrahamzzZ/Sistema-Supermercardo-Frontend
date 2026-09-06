import { Component, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ISucursal } from '../../../../core/interfaces/sucursal';
import { MatDialogRef } from '@angular/material/dialog';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { DataTableComponent } from '../../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/utility/components/tableColumn';

@Component({
  selector: 'app-modal-sucursal',
  standalone: true,
  imports: [
    MaterialModule,
    DataTableComponent
  ],
  templateUrl: './modal-sucursal.component.html',
  styleUrl: './modal-sucursal.component.scss'
})
export class ModalSucursalComponent {
  private readonly sucursalService = inject(SucursalService);
  private readonly dialogRef = inject(MatDialogRef<ModalSucursalComponent>);
  dataSource = new MatTableDataSource<ISucursal>([]);
  columnas: TableColumn[] = [
    {key: 'id_Sucursal', label: 'ID', type: 'number'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre_Sucursal', label: 'Nombre', type: 'text'},
    {key: 'direccion_Sucursal', label: 'Dirección', type: 'text'},
    {key: 'accion', label: 'Acción', type: 'select'}
  ];
  filtro = '';

  constructor(

  ) {
    this.obtenerSucursales();
  }

  obtenerSucursales() {
    this.sucursalService.lista().subscribe({
      next: (resp: any) => {
        this.dataSource.data = resp.data.filter((data: ISucursal) => data.estado === true);

        this.dataSource.filterPredicate = (data: ISucursal, filter: string) => {
          const termino = filter.trim().toLowerCase();
          return (
            data.nombre_Sucursal.toLowerCase().includes(termino) ||
            data.direccion_Sucursal.toLowerCase().includes(termino) ||
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

  seleccionarSucursal(sucursal: ISucursal) {
    this.dialogRef.close(sucursal);
  }

  cerrar() {
    this.dialogRef.close();
  }

  getEstado(estado: boolean): string {
    return estado ? 'Abierto' : 'Cerrado';
  }
}
