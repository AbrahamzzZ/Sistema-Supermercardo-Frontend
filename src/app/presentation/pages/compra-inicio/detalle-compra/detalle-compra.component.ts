import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { CompraService } from '../../../../core/services/compra.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-detalle-compra',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './detalle-compra.component.html',
  styleUrl: './detalle-compra.component.scss'
})
export class DetalleCompraComponent implements OnInit, AfterViewInit{
  public mensajeBusqueda = '';
  public compra!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly servicio = inject(CompraService);
  public dataSource = new MatTableDataSource<any>();
  public columnasTabla: string[] = [
    'id',
    'nombre',
    'precio_Compra',
    'precio_Venta',
    'cantidad',
    'subTotal'
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.compra = this.fb.group({
      fecha: [''],
      tipoDocumento: [''],
      codigoUsuario: [''],
      nombreUsuario: [''],
      nombreSucursal: [''],
      direccionSucursal: [''],
      codigoProveedor: [''],
      proveedor: [''],
      cedulaProveedor: [''],
      codigoTransportista: [''],
      transportista: [''],
      cedulaTransportista: [''],
      totalPagar: ['']
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  filtrarCompra(numeroDocumento: string) {
    this.mensajeBusqueda = '';

    if (!numeroDocumento.trim()) {
      this.limpiar();
      return;
    }

    if (numeroDocumento.length !== 5) {
      this.limpiar();
      this.mensajeBusqueda =
        'El número de documento debe tener 5 dígitos.';
      return;
    }

    this.servicio.obtener(numeroDocumento).subscribe({
      next: (resp: any) => {
        if (!resp?.data) {
          this.limpiar();
          this.mensajeBusqueda =
            'No existe ningún detalle de compra con ese número de documento.';
          return;
        }

        const compra = resp.data;

        this.compra.patchValue({
          fecha: compra.fecha_Compra,
          tipoDocumento: compra.tipo_Documento,
          codigoUsuario: compra.codigo_Usuario,
          nombreUsuario: compra.nombre_Completo,
          nombreSucursal: compra.nombre_Sucursal,
          direccionSucursal: compra.direccion_Sucursal,
          codigoProveedor: compra.codigo_Proveedor,
          proveedor: `${compra.nombres_Proveedor} ${compra.apellidos_Proveedor}`,
          cedulaProveedor: compra.cedula_Proveedor,
          codigoTransportista: compra.codigo_Transportista,
          transportista: `${compra.nombres_Transportista} ${compra.apellidos_Transportista}`,
          cedulaTransportista: compra.cedula_Transportista,
          totalPagar: compra.monto_Total
        });

        this.servicio.obtenerDetalleCompra(compra.id_Compra).subscribe({
          next: (resp: any) => {
            const detalle = resp.data;
            this.dataSource.data = Array.isArray(detalle) ? detalle : [detalle];
          },
          error: () => {
            this.mostrarMensaje(
              'Error al obtener el detalle de la compra.',
              'error'
            );
          }
        });
      },
      error: () => {
        this.limpiar();
        this.mensajeBusqueda =
          'No existe ningún detalle de compra con ese número de documento.';
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

      // Nombre empresa
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Minimarket Paradisia', pageWidth / 2, 45, { align: 'center' });

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprobante de Compra', pageWidth / 2, 53, { align: 'center' });

      // Línea separadora
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(10, 58, pageWidth - 10, 58);

      // Información de la compra
      doc.setFontSize(10);
      doc.text(`Fecha: ${this.compra.value.fecha}`, 10, 66);
      doc.text(`Tipo Doc: ${this.compra.value.tipoDocumento}`, 110, 66);

      doc.text(`Sucursal: ${this.compra.value.nombreSucursal}`, 10, 72);
      doc.text(`Dirección: ${this.compra.value.direccionSucursal}`, 110, 72);

      doc.text(`Vendedor: ${this.compra.value.nombreUsuario}`, 10, 78);
      doc.text(`Código: ${this.compra.value.codigoUsuario}`, 110, 78);

      doc.text(
        `Proveedor: ${this.compra.value.proveedor}`,
        10,
        84
      );
      doc.text(`Cédula: ${this.compra.value.cedulaProveedor}`, 110, 84);

      doc.text(
        `Transportista: ${this.compra.value.transportista}`,
        10,
        90
      );
      doc.text(`Cédula: ${this.compra.value.cedulaTransportista}`, 110, 90);

      // Columnas de la tabla
      const columnas = [
        { header: 'Producto', dataKey: 'nombre' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'Precio Compra', dataKey: 'precio_Compra' },
        { header: 'Precio Venta', dataKey: 'precio_Venta' },
        { header: 'Subtotal', dataKey: 'subTotal' }
      ];

      // Filas de datos
      const filas = this.dataSource.data.map((item) => ({
        nombre: item.productos,
        cantidad: item.cantidad,
        precio_Compra: `$${item.precio_Compra.toFixed(2)}`,
        precio_Venta: `$${item.precio_Venta.toFixed(2)}`,
        subTotal: `$${item.subTotal.toFixed(2)}`
      }));

      // Tabla con diseño igual al de ventas
      autoTable(doc, {
        columns: columnas,
        body: filas,
        startY: 100,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { halign: 'center', cellPadding: 2 }
      });

      // Totales en recuadro gris
      const finalY = (doc as any).lastAutoTable.finalY || 95;
      doc.setFillColor(240, 240, 240);
      doc.rect(10, finalY + 5, pageWidth - 20, 20, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Total a pagar: $${Number.parseFloat(this.compra.value.totalPagar).toFixed(2)}`,
        12,
        finalY + 12
      );

      // Mensaje final
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(
        '¡Gracias por su preferencia!',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      // Guardar PDF
      doc.save('detalle_compra.pdf');
    };
  }

  limpiar() {
    this.compra.reset();
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
