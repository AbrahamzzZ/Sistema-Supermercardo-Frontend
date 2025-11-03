import { Component, inject } from '@angular/core';
import { NegocioService } from '../../../core/services/negocio.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-estadistica-negocio',
  standalone: true,
  imports: [MaterialModule, NgChartsModule],
  templateUrl: './estadistica-negocio.component.html',
  styleUrl: './estadistica-negocio.component.scss'
})
export class EstadisticaNegocioComponent {
  private negocioService = inject(NegocioService);
  private snackBar = inject(MatSnackBar);
  public chartType: ChartType = 'bar';

  public chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        backgroundColor: []
      }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  private generarColores(cantidad: number): string[] {
    const coloresBase = [
      '#42A5F5',
      '#66BB6A',
      '#FFA726',
      '#26A69A',
      '#AB47BC',
      '#EF5350',
      '#8D6E63'
    ];
    let colores: string[] = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(coloresBase[i % coloresBase.length]);
    }
    return colores;
  }

  public chartPlugins = [];

  verEstadisticas1() {
    this.negocioService.obtenerProductosComprados().subscribe({
      next: (resp: any) => {
        this.chartData = {
          labels: resp.data.map((item: { nombre_Producto: any }) => item.nombre_Producto),
          datasets: [
            {
              data: resp.data.map((item: { cantidad_Comprada: any }) => item.cantidad_Comprada),
              label: 'Cantidad Comprada',
              backgroundColor: this.generarColores(resp.data.length)
            }
          ]
        };
        this.chartType = 'bar';
      }
    });
  }

  verEstadisticas2() {
    this.negocioService.obtenerProductosVendidos().subscribe({
      next: (resp: any) => {
        this.chartData = {
          labels: resp.data.map((item: { nombre_Producto: any }) => item.nombre_Producto),
          datasets: [
            {
              data: resp.data.map((item: { cantidad_Vendida: any }) => item.cantidad_Vendida),
              label: 'Cantidad Vendida',
              backgroundColor: this.generarColores(resp.data.length)
            }
          ]
        };
        this.chartType = 'bar';
      }
    });
  }

  verEstadisticas3() {
    this.negocioService.obtenerVentaEmpleados().subscribe({
      next: (resp: any) => {
        this.chartData = {
          labels: resp.data.map((item: { nombre_Completo: any }) => item.nombre_Completo),
          datasets: [
            {
              data: resp.data.map((item: { ventas_Empleado: any }) => item.ventas_Empleado),
              label: 'Ventas Realizadas',
              backgroundColor: this.generarColores(resp.data.length)
            }
          ]
        };
        this.chartType = 'pie';
      }
    });
  }

  verEstadisticas4() {
    this.negocioService.obtenerTopClientes().subscribe({
      next: (resp: any) => {
        this.chartData = {
          labels: resp.data.map((item: { nombre_Completo: any }) => item.nombre_Completo),
          datasets: [
            {
              data: resp.data.map((item: { compras_Totales: any }) => item.compras_Totales),
              label: 'Ventas Totales',
              backgroundColor: this.generarColores(resp.data.length)
            }
          ]
        };
        this.chartType = 'bar';
      }
    });
  }

  verEstadisticas5() {
    this.negocioService.obtenerTopProveedores().subscribe({
      next: (resp: any) => {
        this.chartData = {
          labels: resp.data.map((item: { nombre_Completo: any }) => item.nombre_Completo),
          datasets: [
            {
              data: resp.data.map((item: { compras_Totales: any }) => item.compras_Totales),
              label: 'Compras Totales',
              backgroundColor: this.generarColores(resp.data.length)
            }
          ]
        };
        this.chartType = 'bar';
      }
    });
  }

  verEstadisticas6() {
    this.negocioService.obtenerViajesTransportista().subscribe({
      next: (resp: any) => {
        this.chartData = {
          labels: resp.data.map((item: { nombre_Completo: any }) => item.nombre_Completo),
          datasets: [
            {
              data: resp.data.map((item: { viajes_Realizados: any }) => item.viajes_Realizados),
              label: 'Compras Totales',
              backgroundColor: this.generarColores(resp.data.length)
            }
          ]
        };
        this.chartType = 'pie';
      }
    });
  }

  descargarPDF(): void {
  const chartElement = document.querySelector(
    '.estadistica-negocio__grafico-contenedor'
  ) as HTMLElement;

  const tieneDatos =
    this.chartData &&
    this.chartData.datasets &&
    this.chartData.datasets.length > 0 &&
    this.chartData.datasets.some(dataset =>
      Array.isArray(dataset.data) && dataset.data.length > 0
    );

  if (!tieneDatos) {
    this.mostrarMensaje('No hay datos cargados para exportar.', 'error');
    return;
  }

  if (!chartElement || chartElement.clientHeight === 0) {
    this.mostrarMensaje('No se encontró el gráfico o no hay datos para mostrar.', 'error');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const logoUrl = 'assets/images/logo.png';
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    doc.addImage(img, 'PNG', 10, 10, 30, 30);
    doc.setFontSize(16);
    doc.text('Reporte Estadístico del Negocio', 50, 20);

    doc.setFontSize(11);
    const fecha = new Date().toLocaleString();
    doc.text(`Fecha de generación: ${fecha}`, 10, 50);

    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = doc.internal.pageSize.getWidth() - 20;
      const imgProps = doc.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const startY = 70;
      doc.addImage(imgData, 'PNG', 10, startY, pdfWidth, pdfHeight);
      doc.save('reporte_estadistico_negocio.pdf');
    });
  };
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
}
