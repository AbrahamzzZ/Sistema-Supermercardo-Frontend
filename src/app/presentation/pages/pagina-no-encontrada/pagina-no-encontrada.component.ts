import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagina-no-encontrada',
  imports: [RouterLink],
  templateUrl: './pagina-no-encontrada.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pagina-no-encontrada.component.scss'
})
export class PaginaNoEncontradaComponent {}
