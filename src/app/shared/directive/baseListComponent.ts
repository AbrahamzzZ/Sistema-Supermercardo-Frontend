import { computed, Directive, effect, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { HttpResourceRef } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiResponse } from '../../core/setting/api/apiResponse';
import { ApiPaginado } from '../../core/setting/api/apiPaginado';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';

@Directive()
export abstract class BaseListComponent<T> {
  readonly pagina = signal(1);
  readonly pageSize = signal(5);
  readonly filtro = signal('');

  protected readonly params = computed(() => ({
    pageNumber: this.pagina(),
    pageSize: this.pageSize(),
    filtro: this.filtro()
  }));

  protected abstract readonly recurso: HttpResourceRef<ApiResponse<ApiPaginado<T>> | undefined>;
  public readonly items = computed<T[]>(() =>
    this.recurso.hasValue() ? (this.recurso.value()?.data.items ?? []) : []
  );
  public readonly totalRegistros = computed(() =>
    this.recurso.hasValue() ? (this.recurso.value()?.data?.totalCount ?? 0) : 0
  );
  public readonly cargando = computed(() => this.recurso.isLoading());
  public listaData = new MatTableDataSource<T>();
  private readonly filtroSubject = new Subject<string>();

  constructor() {
    effect(() => {
      this.listaData.data = this.items();
    });

    this.filtroSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((f) => {
        this.pagina.set(1);
        this.filtro.set(f);
      });
  }

  filtrar(termino: string): void {
    this.filtroSubject.next(termino.trim());
  }

  cambiarPagina(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pagina.set(event.pageIndex + 1);
  }

  refrescarDesdeInicio(): void {
    if (this.pagina() === 1) {
      this.recurso.reload();
    } else {
      this.pagina.set(1);
    }
  }

  abstract get tituloExcel(): string;
}
