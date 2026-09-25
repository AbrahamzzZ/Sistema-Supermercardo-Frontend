import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Route, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { IMenu } from '../../../../core/interfaces/menu';
import { obtenerRutaBase } from '../../../../core/setting/menu/secciones-menu';
import { MaterialModule } from '../../../ui/material-module';

interface IMiga {
  etiqueta: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [MaterialModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  @Input() set menus(menus: IMenu[]) {
    this.listaMenus = menus;
    this.construirMigas();
  }
  private readonly router = inject(Router);
  private listaMenus: IMenu[] = [];

  migas: IMiga[] = [];

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.construirMigas());
    this.construirMigas();
  }

  /**
   * Arma la ruta a partir de la URL:
   * /transportista           -> Inicio > Transportistas
   * /transportista/editar/1  -> Inicio > Transportistas > Editar Transportista
   */
  private construirMigas() {
    const url = this.router.url.split(/[?#]/)[0];
    const base = obtenerRutaBase(url);
    const migas: IMiga[] = [{ etiqueta: 'Inicio', url: '/home' }];

    if (base && base !== 'home') {
      migas.push({ etiqueta: this.obtenerEtiquetaModulo(base), url: '/' + base });

      const esSubpagina = url.replace(/^\/+|\/+$/g, '').split('/').length > 1;
      const tituloActual = this.obtenerTituloActual();
      if (esSubpagina && tituloActual) {
        migas.push({ etiqueta: tituloActual });
      }
    }

    delete migas[migas.length - 1].url;
    this.migas = migas;
  }

  private obtenerEtiquetaModulo(base: string): string {
    const menu = this.listaMenus.find((m) => obtenerRutaBase(m.urlMenu) === base);
    if (menu) return menu.nombreMenu;

    const titulo = this.buscarTituloRuta(this.router.config, base);
    return titulo ?? base.charAt(0).toUpperCase() + base.slice(1);
  }

  private buscarTituloRuta(rutas: Route[], path: string): string | undefined {
    for (const ruta of rutas) {
      if (ruta.path === path && typeof ruta.title === 'string') return ruta.title;
      if (ruta.children) {
        const titulo = this.buscarTituloRuta(ruta.children, path);
        if (titulo) return titulo;
      }
    }
    return undefined;
  }

  private obtenerTituloActual(): string | undefined {
    let snapshot: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let titulo: string | undefined;
    while (snapshot) {
      titulo = snapshot.title ?? titulo;
      snapshot = snapshot.firstChild;
    }
    return titulo;
  }
}
