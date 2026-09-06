import { Component, inject } from '@angular/core';
import { ICliente } from '../../../../core/interfaces/cliente';
import { ClienteService } from '../../../../core/services/cliente.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { DataTableComponent } from '../../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/utility/components/tableColumn';

@Component({
  selector: 'app-modal-cliente',
  standalone: true,
  imports: [
    MaterialModule,
    DataTableComponent
  ],
  templateUrl: './modal-cliente.component.html',
  styleUrl: './modal-cliente.component.scss'
})
export class ModalClienteComponent {
  private readonly clienteService = inject(ClienteService);
  private readonly dialogRef = inject(MatDialogRef<ModalClienteComponent>);
  dataSource = new MatTableDataSource<ICliente>([]);
  columnas: TableColumn[] = [
    {key: 'id_Cliente', label: 'ID', type: 'number'},
    {key: 'nombres', label: 'Nombres', type: 'text'},
    {key: 'apellidos', label: 'Apellidos', type: 'text'},
    {key: 'cedula', label: 'Cédula', type: 'text'},
    {key: 'accion', label: 'Acción', type: 'select'}
  ];
  filtro = '';

  constructor(
  ) {
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.clienteService.lista().subscribe({
      next: (resp: ICliente[] | { data: ICliente[] }) => {
        const clientes = Array.isArray(resp) ? resp : resp.data;
        this.dataSource.data = clientes.filter((data: ICliente & { estado?: boolean }) => data.estado !== false);
        this.dataSource.filterPredicate = (data: ICliente, filter: string) => {
          const termino = filter.trim().toLowerCase();
          return (
            data.nombres.toLowerCase().includes(termino) ||
            data.apellidos.toLowerCase().includes(termino) ||
            data.cedula.toLowerCase().includes(termino)
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

  seleccionarCliente(cliente: ICliente) {
    this.dialogRef.close(cliente);
  }

  cerrar() {
    this.dialogRef.close();
  }
}
