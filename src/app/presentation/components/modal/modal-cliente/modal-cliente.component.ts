import { Component, inject } from '@angular/core';
import { ICliente } from '../../../../core/interfaces/cliente';
import { ClienteService } from '../../../../core/services/cliente.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-modal-cliente',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './modal-cliente.component.html',
  styleUrl: './modal-cliente.component.scss'
})
export class ModalClienteComponent {
  private readonly clienteService = inject(ClienteService);
  private readonly dialogRef = inject(MatDialogRef<ModalClienteComponent>);
  dataSource = new MatTableDataSource<ICliente>([]);
  columnas: string[] = ['id', 'nombres', 'apellidos', 'cedula', 'accion'];
  filtro = '';

  constructor(
  ) {
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.clienteService.lista().subscribe({
      next: (resp: any) => {
        this.dataSource.data = resp.data;

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
