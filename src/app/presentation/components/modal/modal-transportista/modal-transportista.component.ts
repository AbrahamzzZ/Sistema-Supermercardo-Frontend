import { Component, inject } from '@angular/core';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { MatDialogRef } from '@angular/material/dialog';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { MatTableDataSource } from '@angular/material/table';
import { NgClass } from '@angular/common';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-modal-transportista',
  standalone: true,
  imports: [
    NgClass,
    MaterialModule
  ],
  templateUrl: './modal-transportista.component.html',
  styleUrl: './modal-transportista.component.scss'
})
export class ModalTransportistaComponent {
  private readonly transportistaService = inject(TransportistaService);
  private readonly dialogRef = inject(MatDialogRef<ModalTransportistaComponent>);
  dataSource = new MatTableDataSource<ITransportista>([]);
  columnas: string[] = ['id', 'nombres', 'apellidos', 'cedula', 'estado', 'accion'];
  filtro = '';

  constructor(
  ) {
    this.obtenerTransportistas();
  }

  obtenerTransportistas() {
    this.transportistaService.lista().subscribe({
      next: (resp: any) => {
        this.dataSource.data = resp.data;

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
