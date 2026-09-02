import { Directive, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Directive()
export abstract class BaseListComponent<T> implements OnInit {
  public listaData = new MatTableDataSource<T>();
  public totalRegistros = 0;
  public pageSize = 5;
  public filtroActual = '';
  
  protected readonly filtroSubject = new Subject<string>();
  protected readonly filtrosCache = new Map<string, any>();
  protected abortController = new AbortController();

  ngOnInit(): void {
    this.inicializarFiltro();
    this.obtenerDatos(1, this.pageSize, '');
  }

  private inicializarFiltro(): void {
    this.filtroSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((filtro) => {
        return Promise.resolve(filtro);
      })
    ).subscribe((filtro) => {
      this.obtenerDatos(1, this.pageSize, filtro);
    });
  }

  cambiarPagina(event: any): void {
    this.obtenerDatos(
      event.pageIndex + 1,
      event.pageSize,
      this.filtroActual
    );
  }

  filtrar(termino: string): void {
    this.filtroActual = termino.trim();
    this.abortController.abort();
    this.abortController = new AbortController();
    this.filtroSubject.next(this.filtroActual);
  }

  limpiarCache(): void {
    this.filtrosCache.clear();
  }

  abstract obtenerDatos(pageNumber: number, pageSize: number, filtro: string): void;
  abstract get tituloExcel(): string;
}