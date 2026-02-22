import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { VentaService } from '../../../../core/services/venta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './detalle-venta.component.html',
  styleUrl: './detalle-venta.component.scss'
})
export class DetalleVentaComponent implements OnInit, AfterViewInit {
  public mensajeBusqueda = '';
  public venta!: FormGroup;
  private readonly snackBar = inject(MatSnackBar);
  private readonly servicio = inject(VentaService);
  private readonly fb = inject(FormBuilder);
  public dataSource = new MatTableDataSource<any>();
  public columnasTabla: string[] = [
    'id',
    'nombre',
    'precio_Venta',
    'cantidad',
    'subTotal',
    'descuento'
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.venta = this.fb.group({
      fecha: [''],
      tipoDocumento: [''],
      codigoUsuario: [''],
      nombreUsuario: [''],
      nombreSucursal: [''],
      direccionSucursal: [''],
      codigoCliente: [''],
      cliente: [''],
      cedulaCliente: [''],
      totalPagar: [''],
      pagaCon: [''],
      cambio: [''],
      conDescuento: ['']
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  filtrarVenta(numeroDocumento: string) {
    this.mensajeBusqueda = '';
    if (!numeroDocumento.trim()) return;

    if (numeroDocumento.length != 5) {
      this.limpiar();
      this.mensajeBusqueda = 'No existe ningún detalle de venta con ese número de documento.';
      return;
    }

    this.servicio.obtener(numeroDocumento).subscribe({
      next: (resp: any) => {

        const venta = resp.data;

        this.venta.patchValue({
          fecha: venta.fecha_Venta,
          tipoDocumento: venta.tipo_Documento,
          codigoUsuario: venta.codigo_Usuario,
          nombreUsuario: venta.nombre_Completo,
          nombreSucursal: venta.nombre_Sucursal,
          direccionSucursal: venta.direccion_Sucursal,
          codigoCliente: venta.codigo_Cliente,
          cliente: `${venta.nombres_Cliente} ${venta.apellidos_Cliente}`,
          cedulaCliente: venta.cedula_Cliente,
          totalPagar: venta.monto_Total,
          pagaCon: venta.monto_Pago,
          cambio: venta.monto_Cambio,
          conDescuento: venta.descuento
        });

        this.servicio.obtenerDetalleVenta(venta.id_Venta).subscribe({
          next: (resp: any) => {
            const detalle = resp.data;
            this.dataSource.data = Array.isArray(detalle) ? detalle : [detalle];
          },
          error: () => {
            this.mostrarMensaje(
              'Error al obtener el detalle de la venta.',
              'error'
            );
          }
        });
      },
      error: () => {
        this.limpiar();
        this.mensajeBusqueda =
          'No existe ningún detalle de venta con ese número de documento.';
      }
    });
  }

  descargarPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoUrl = 'assets/images/logo.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      // Logo centrado
      doc.addImage(img, 'PNG', (pageWidth - 30) / 2, 10, 30, 30);

      // Nombre de la empresa
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Minimarket Paradisia', pageWidth / 2, 45, { align: 'center' });

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprobante de Venta', pageWidth / 2, 53, { align: 'center' });

      // Línea separadora
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(10, 58, pageWidth - 10, 58);

      // Información de la venta
      doc.setFontSize(10);
      doc.text(`Fecha: ${this.venta.value.fecha}`, 10, 66);
      doc.text(`Tipo Doc: ${this.venta.value.tipoDocumento}`, 110, 66);

      doc.text(`Sucursal: ${this.venta.value.nombreSucursal}`, 10, 72);
      doc.text(`Dirección: ${this.venta.value.direccionSucursal}`, 110, 72);

      doc.text(`Vendedor: ${this.venta.value.nombreUsuario}`, 10, 78);
      doc.text(`Código: ${this.venta.value.codigoUsuario}`, 110, 78);

      doc.text(
        `Cliente: ${this.venta.value.cliente}`,
        10,
        84
      );
      doc.text(`Cédula: ${this.venta.value.cedulaCliente}`, 110, 84);

      // Columnas de la tabla
      const columnas = [
        { header: 'Producto', dataKey: 'nombre' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'Precio', dataKey: 'precio_Venta' },
        { header: 'Subtotal', dataKey: 'subTotal' },
        { header: 'Descuento', dataKey: 'descuento' }
      ];

      // Filas de datos
      const filas = this.dataSource.data.map((item) => ({
        nombre: item.productos,
        cantidad: item.cantidad,
        precio_Venta: `$${item.precio_Venta.toFixed(2)}`,
        subTotal: `$${item.subTotal.toFixed(2)}`,
        descuento: `${item.descuento}%`
      }));

      // Tabla con diseño mejorado
      autoTable(doc, {
        columns: columnas,
        body: filas,
        startY: 90,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { halign: 'center', cellPadding: 2 }
      });

      // Totales en recuadro gris
      const finalY = (doc as any).lastAutoTable.finalY || 85;
      doc.setFillColor(240, 240, 240);
      doc.rect(10, finalY + 5, pageWidth - 20, 20, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Total a pagar: $${Number.parseFloat(this.venta.value.totalPagar).toFixed(2)}`,
        12,
        finalY + 12
      );
      doc.text(`Pagó con: $${Number.parseFloat(this.venta.value.pagaCon).toFixed(2)}`, 12, finalY + 18);
      doc.text(`Cambio: $${Number.parseFloat(this.venta.value.cambio).toFixed(2)}`, 100, finalY + 12);

      // Mensaje final
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('¡Gracias por su compra!', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
        align: 'center'
      });

      // Guardar PDF
      doc.save('detalle_venta.pdf');
    };
  }

  limpiar() {
    this.venta.reset();
    this.dataSource.data = [];
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
