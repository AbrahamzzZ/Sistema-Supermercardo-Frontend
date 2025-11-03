import { Component, inject } from '@angular/core';
import { ITransportista } from '../../../core/interfaces/transportista';
import { MatDialogRef } from '@angular/material/dialog';
import { TransportistaService } from '../../../core/services/transportista.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modal-transportista',
  standalone: true,
  imports: [
    MatTableModule,
    MatIcon,
    NgClass,
    MatFormFieldModule,
    NgIf,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './modal-transportista.component.html',
  styleUrl: './modal-transportista.component.scss'
})
export class ModalTransportistaComponent {
  private transportistaService = inject(TransportistaService);
  private dialogRef = inject(MatDialogRef<ModalTransportistaComponent>);
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
