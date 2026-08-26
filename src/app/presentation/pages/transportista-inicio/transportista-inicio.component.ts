import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { TransportistaService } from '../../../core/services/transportista.service';
import { ITransportista } from '../../../core/interfaces/transportista';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/utility/components/tableColumn';

@Component({
  selector: 'app-transportista-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './transportista-inicio.component.html',
  styleUrl: './transportista-inicio.component.scss'
})
export class TransportistaInicioComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly transportistaServicio = inject(TransportistaService);
  private readonly snackBar = inject(MatSnackBar);
  public listaTransportista = new MatTableDataSource<ITransportista>();
  public tituloExcel = 'Transportistas';
  public totalRegistros = 0;
  public pageSize = 5;
  public displayedColumns: string[] = [
    'id',
    'codigo',
    'nombres',
    'apellidos',
    'cedula',
    'telefono',
    'correo_Electronico',
    'foto',
    'estado',
    'fecha_Creacion',
    'accion'
  ];

  columns: TableColumn[] = [
    {key: 'id_Transportista', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombres', label: 'Nombres', type: 'text'},
    {key: 'apellidos', label: 'Apellidos', type: 'text'},
    {key: 'cedula', label: 'Cédula', type: 'text'},
    {key: 'telefono', label: 'Teléfono', type: 'text'},
    {key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text'},
    {key: 'foto', label: 'Foto', type: 'image'},
    {key: 'estado', label: 'Estado', type: 'status'},
    {key: 'fecha_Creacion', label: 'Fecha de Creación', type: 'date'},
    {key: 'accion', label: 'Acción', type: 'actions'}
  ];

  ngOnInit() {
    this.obtenerTransportistas(1, this.pageSize);
  }

  cambiarPagina(event: PageEvent) {
    this.obtenerTransportistas(
      event.pageIndex + 1,
      event.pageSize
    );
  }

  obtenerTransportistas(pageNumber: number, pageSize: number) {
    this.transportistaServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;

        this.listaTransportista.data = arr.map((t: ITransportista) => {
          if (t.foto && typeof t.foto === 'string') {
            t.foto = `data:image/*;base64,${t.foto}`;
          } else {
            t.foto = 'assets/images/default-avatar.jpg';
          }
          return t;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(transportista: ITransportista) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar al transportista ${transportista.nombres} ${transportista.apellidos}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.transportistaServicio.eliminar(transportista.id_Transportista).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerTransportistas(1, this.pageSize);
              this.mostrarMensaje('Transportista eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar al transportista.', 'error');
          }
        });
      }
    });
  }

  nuevo() {
    this.router.navigate(['transportista/transportista-registro', 0]);
  }

  editar(transportista: ITransportista) {
    this.router.navigate(['transportista/transportista-editar', transportista.id_Transportista]);
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

  filtrarTransportistas(termino: string) {
    this.listaTransportista.filter = termino.trim().toLowerCase();
    if (this.listaTransportista.paginator) {
      this.listaTransportista.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaTransportista.data.map((transportista) => ({
      ID: transportista.id_Transportista,
      Código: transportista.codigo,
      Nombres: transportista.nombres,
      Apellidos: transportista.apellidos,
      Cedula: transportista.cedula,
      Telefono: transportista.telefono,
      'Correo Electronico': transportista.correo_Electronico,
      Estado: this.getEstado(transportista.estado),
      'Fecha Creacion': this.getFechaRegistro(transportista.fecha_Creacion ?? '')
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombres',
      'Apellidos',
      'Cedula',
      'Telefono',
      'Correo Electronico',
      'Estado',
      'Fecha Creacion'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }

  getFechaRegistro(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
