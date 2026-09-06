import { Component, inject } from '@angular/core';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { MatDialogRef } from '@angular/material/dialog';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { DataTableComponent } from '../../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/utility/components/tableColumn';

@Component({
  selector: 'app-modal-transportista',
  standalone: true,
  imports: [
    MaterialModule,
    DataTableComponent
  ],
  templateUrl: './modal-transportista.component.html',
  styleUrl: './modal-transportista.component.scss'
})
export class ModalTransportistaComponent {
  private readonly transportistaService = inject(TransportistaService);
  private readonly dialogRef = inject(MatDialogRef<ModalTransportistaComponent>);
  dataSource = new MatTableDataSource<ITransportista>([]);
  columnas: TableColumn[] = [
    {key: 'id_Transportista', label: 'ID', type: 'number'},
    {key: 'nombres', label: 'Nombres', type: 'text'},
    {key: 'apellidos', label: 'Apellidos', type: 'text'},
    {key: 'cedula', label: 'Cédula', type: 'text'},
    {key: 'accion', label: 'Acción', type: 'select'}
  ];
  filtro = '';

  constructor(
  ) {
    this.obtenerTransportistas();
  }

  obtenerTransportistas() {
    this.transportistaService.lista().subscribe({
      next: (resp: any) => {
        this.dataSource.data = resp.data.filter((data: ITransportista) => data.estado === true);

        this.dataSource.filterPredicate = (data: ITransportista, filter: string) => {
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

  seleccionarTransportista(transportista: ITransportista) {
    this.dialogRef.close(transportista);
  }

  cerrar() {
    this.dialogRef.close();
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }
}
