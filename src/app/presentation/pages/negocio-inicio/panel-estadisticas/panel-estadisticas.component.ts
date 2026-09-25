import { Component, computed, effect, inject, input, OnInit, output, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Observable } from 'rxjs';
import jsPDF from 'jspdf';
import { NegocioService } from '../../../../core/services/negocio.service';
import { ApiResponse } from '../../../../core/setting/api/apiResponse';
import { MaterialModule } from '../../../../shared/ui/material-module';

export type ClaveEstadistica = 'comprados' | 'vendidos' | 'empleados' | 'clientes' | 'proveedores' | 'transportistas';

export interface ContextoEstadistica {
  titulo: string;
  datos: string;
}

interface Estadistica {
  clave: ClaveEstadistica;
  titulo: string;
  icono: string;
  tipo: ChartType;
  serie: string;
  obtener: () => Observable<ApiResponse<any[]>>;
  etiqueta: (item: any) => string;
  valor: (item: any) => number;
}

@Component({
  selector: 'app-panel-estadisticas',
  imports: [MaterialModule, NgChartsModule],
  templateUrl: './panel-estadisticas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './panel-estadisticas.component.scss'
})
export class PanelEstadisticasComponent implements OnInit {
  private readonly negocioServicio = inject(NegocioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly grafico = viewChild(BaseChartDirective);

  readonly permitidas = input<ClaveEstadistica[] | null>(null);
  readonly nombreNegocio = input('');
  readonly contextoCambio = output<ContextoEstadistica>();

  private readonly todas: Estadistica[] = [
    {
      clave: 'comprados', titulo: 'Productos más comprados', icono: 'shopping_cart', tipo: 'bar', serie: 'Cantidad comprada',
      obtener: () => this.negocioServicio.obtenerProductosComprados(),
      etiqueta: (i) => i.nombre_Producto, valor: (i) => i.cantidad_Comprada
    },
    {
      clave: 'vendidos', titulo: 'Productos más vendidos', icono: 'sell', tipo: 'bar', serie: 'Cantidad vendida',
      obtener: () => this.negocioServicio.obtenerProductosVendidos(),
      etiqueta: (i) => i.nombre_Producto, valor: (i) => i.cantidad_Vendida
    },
    {
      clave: 'empleados', titulo: 'Empleados más productivos', icono: 'badge', tipo: 'pie', serie: 'Ventas realizadas',
      obtener: () => this.negocioServicio.obtenerVentaEmpleados(),
      etiqueta: (i) => i.nombre_Completo, valor: (i) => i.ventas_Empleado
    },
    {
      clave: 'clientes', titulo: 'Clientes frecuentes', icono: 'groups', tipo: 'bar', serie: 'Compras totales',
      obtener: () => this.negocioServicio.obtenerTopClientes(),
      etiqueta: (i) => i.nombre_Completo, valor: (i) => i.compras_Totales
    },
    {
      clave: 'proveedores', titulo: 'Proveedores preferidos', icono: 'local_shipping', tipo: 'bar', serie: 'Compras totales',
      obtener: () => this.negocioServicio.obtenerTopProveedores(),
      etiqueta: (i) => i.nombre_Completo, valor: (i) => i.compras_Totales
    },
    {
      clave: 'transportistas', titulo: 'Viajes de transportistas', icono: 'route', tipo: 'pie', serie: 'Viajes realizados',
      obtener: () => this.negocioServicio.obtenerViajesTransportista(),
      etiqueta: (i) => i.nombre_Completo, valor: (i) => i.viajes_Realizados
    }
  ];

  protected readonly estadisticas = computed(() => {
    const permitidas = this.permitidas();
    return permitidas ? this.todas.filter((e) => permitidas.includes(e.clave)) : this.todas;
  });

  protected readonly seleccionada = signal<Estadistica>(this.todas[0]);
  protected readonly cargando = signal(false);
  protected readonly etiquetas = signal<string[]>([]);
  protected readonly valores = signal<number[]>([]);

  protected readonly chartData = computed<ChartConfiguration['data']>(() => ({
    labels: this.etiquetas(),
    datasets: [
      {
        data: this.valores(),
        label: this.seleccionada().serie,
        backgroundColor: this.generarColores(this.valores().length),
        borderRadius: this.seleccionada().tipo === 'bar' ? 6 : 0
      }
    ]
  }));

  protected readonly chartOptions = computed<ChartConfiguration['options']>(() => {
    const esBarra = this.seleccionada().tipo === 'bar';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: !esBarra, position: 'bottom' }
      },
      scales: esBarra
        ? { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } }
        : undefined
    };
  });

  constructor() {
    effect(() => {
      this.contextoCambio.emit({
        titulo: this.seleccionada().titulo,
        datos: this.etiquetas().map((etiqueta, i) => `${etiqueta}: ${this.valores()[i]}`).join('; ')
      });
    });
  }

  ngOnInit(): void {
    const primera = this.estadisticas()[0];
    if (primera) this.seleccionar(primera);
  }

  seleccionar(estadistica: Estadistica): void {
    this.seleccionada.set(estadistica);
    this.cargando.set(true);

    estadistica.obtener().subscribe({
      next: (resp) => {
        const datos = resp.data ?? [];
        this.etiquetas.set(datos.map(estadistica.etiqueta));
        this.valores.set(datos.map(estadistica.valor));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.etiquetas.set([]);
        this.valores.set([]);
        this.cargando.set(false);
        this.mostrarMensaje('Error al cargar la estadística.');
      }
    });
  }

  descargarPDF(): void {
    const imagenGrafico = this.grafico()?.toBase64Image();
    if (!this.valores().length || !imagenGrafico) {
      this.mostrarMensaje('No hay datos cargados para exportar.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const anchoPagina = doc.internal.pageSize.getWidth();

    const generar = (logo?: HTMLImageElement) => {
      if (logo) doc.addImage(logo, 'PNG', 10, 10, 25, 25);
      doc.setFontSize(16);
      doc.text(this.nombreNegocio() || 'Reporte del negocio', 42, 20);
      doc.setFontSize(12);
      doc.text(this.seleccionada().titulo, 42, 28);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`, 42, 34);

      const props = doc.getImageProperties(imagenGrafico);
      const ancho = anchoPagina - 20;
      const alto = Math.min((props.height * ancho) / props.width, 150);
      doc.addImage(imagenGrafico, 'PNG', 10, 45, (props.width * alto) / props.height, alto);
      doc.save(`estadistica_${this.seleccionada().clave}.pdf`);
    };

    const logo = new Image();
    logo.onload = () => generar(logo);
    logo.onerror = () => generar();
    logo.src = 'assets/images/logo.png';
  }

  private generarColores(cantidad: number): string[] {
    // Tonos apagados que combinan con la paleta de la app (ver src/styles/_paleta.scss)
    const base = ['#4479b0', '#86993f', '#5f9ea0', '#c9955c', '#8a7fb5', '#79acde', '#b07a6b', '#5c6b7a'];
    return Array.from({ length: cantidad }, (_, i) => base[i % base.length]);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
