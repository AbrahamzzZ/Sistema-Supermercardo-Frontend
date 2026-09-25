import { Component, computed, inject, input, OnInit, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NegocioService } from '../../../../core/services/negocio.service';
import { INegocio } from '../../../../core/interfaces/negocio';
import { Metodos } from '../../../../shared/utility/metodos';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { EditarNegocioDialogComponent } from '../editar-negocio-dialog/editar-negocio-dialog.component';

@Component({
  selector: 'app-cabecera-negocio',
  imports: [MaterialModule],
  templateUrl: './cabecera-negocio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cabecera-negocio.component.scss'
})
export class CabeceraNegocioComponent implements OnInit {
  private readonly idNegocio = 1;
  private readonly negocioServicio = inject(NegocioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly puedeEditar = input(false);
  readonly nombreUsuario = input('');
  readonly rolUsuario = input('');
  readonly negocioCargado = output<INegocio>();

  protected readonly negocio = signal<INegocio | null>(null);
  protected readonly logoURL = computed(() => {
    const logo = this.negocio()?.logo;
    return logo ? Metodos.base64AImagen(logo) : 'assets/images/default-avatar.jpg';
  });

  ngOnInit(): void {
    this.negocioServicio.obtener(this.idNegocio).subscribe({
      next: (resp) => this.actualizar(resp.data),
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al obtener la información del negocio.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  editar(): void {
    const negocio = this.negocio();
    if (!negocio || !this.puedeEditar()) return;

    this.dialog
      .open(EditarNegocioDialogComponent, { data: negocio, width: '760px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((actualizado?: INegocio) => {
        if (actualizado) this.actualizar(actualizado);
      });
  }

  private actualizar(negocio: INegocio): void {
    this.negocio.set(negocio);
    this.negocioCargado.emit(negocio);
  }
}
