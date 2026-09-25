import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { IMenu } from '../../../../core/interfaces/menu';
import { LoginService } from '../../../../core/services/login.service';
import {
  agruparMenusPorSeccion,
  ISeccionMenu,
  obtenerRutaBase,
  obtenerSeccionDeRuta
} from '../../../../core/setting/menu/secciones-menu';
import { MaterialModule } from '../../../ui/material-module';

const MENU_INICIO: IMenu = { idMenu: 0, nombreMenu: 'Inicio', urlMenu: '/home', nombreIcono: 'home' };

@Component({
  selector: 'app-sidnebar',
  imports: [MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './sidnebar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sidnebar.component.scss'
})
export class SidnebarComponent {
  @Input() set menus(menus: IMenu[]) {
    const tieneInicio = menus.some((m) => obtenerRutaBase(m.urlMenu) === 'home');
    this.secciones = agruparMenusPorSeccion(tieneInicio ? menus : [MENU_INICIO, ...menus]);
  }
  @Input() isCollapsed = true;
  @Output() toggle = new EventEmitter<void>();
  private readonly router = inject(Router);
  private readonly loginServicio = inject(LoginService);

  secciones: ISeccionMenu[] = agruparMenusPorSeccion([MENU_INICIO]);
  seccionesAbiertas = new Set<string>([obtenerSeccionDeRuta(this.router.url)]);

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe((e) => this.seccionesAbiertas.add(obtenerSeccionDeRuta(e.urlAfterRedirects)));
  }

  toggleSeccion(nombre: string) {
    if (this.seccionesAbiertas.has(nombre)) {
      this.seccionesAbiertas.delete(nombre);
    } else {
      this.seccionesAbiertas.add(nombre);
    }
  }

  toggleSidebar() {
    this.toggle.emit();
  }

  logout() {
    this.loginServicio.logout();
  }
}
