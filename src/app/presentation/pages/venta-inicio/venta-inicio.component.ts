import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { IProducto } from '../../../core/interfaces/producto';
import { LoginService } from '../../../core/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaService } from '../../../core/services/venta.service';
import { ModalClienteComponent } from '../../components/modal/modal-cliente/modal-cliente.component';
import { ICliente } from '../../../core/interfaces/cliente';
import { ModalOfertaComponent } from '../../components/modal/modal-oferta/modal-oferta.component';
import { IOferta } from '../../../core/interfaces/oferta';
import { ModalProductoComponent } from '../../components/modal/modal-producto/modal-producto.component';
import { Router } from '@angular/router';
import { IVenta } from '../../../core/interfaces/venta';
import { IDetalleVenta } from '../../../core/interfaces/detalle-venta';
import { CurrencyPipe } from '@angular/common';
import { DialogoNumeroDocumentoComponent } from '../../components/dialog/dialogo-numero-documento/dialogo-numero-documento.component';
import { ModalSucursalComponent } from '../../components/modal/modal-sucursal/modal-sucursal.component';
import { ISucursal } from '../../../core/interfaces/sucursal';
import { MaterialModule } from '../../../shared/ui/material-module';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-venta-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './venta-inicio.component.html',
  styleUrl: './venta-inicio.component.scss'
})
export class VentaInicioComponent implements OnInit, AfterViewInit{
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public hoy = new Date().toISOString().substring(0, 10);
  public tipoComprobante = 'Boleta';
  public clienteSeleccionado: ICliente | null = null;
  public ofertaSeleccionado: IOferta | null = null;
  public productoSeleccionado: IProducto | null = null;
  public sucursalSelecionada: ISucursal | null = null;
  public producto = { precioVenta: 0, cantidad: 0, subTotal: 0, descuento: 0 };
  public productosAgregados: any[] = [];
  public dataSource = new MatTableDataSource<any>();
  public columnasTabla: string[] = [
    'ID',
    'nombre',
    'precioVenta',
    'cantidad',
    'subtotal',
    'descuento',
    'accion'
  ];
  private servicioVenta = inject(VentaService);
  private snackBar = inject(MatSnackBar);
  private loginServicio = inject(LoginService);
  public numeroDocumento= '';
  public totalSinDescuento = 0;
  public pagaCon = 0;
  public cambio = 0;
  public totalConDescuento = 0;
  public montoDescuento = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  ngOnInit(): void {
    this.obtenerNumeroDocumento();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  abrirModalSucursal() {
    const dialogRef = this.dialog.open(ModalSucursalComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: ISucursal) => {
      if (result) {
        this.sucursalSelecionada = result;
      }
    });
  }

  abrirModalClientes() {
    const dialogRef = this.dialog.open(ModalClienteComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: ICliente) => {
      if (result) {
        this.clienteSeleccionado = result;
      }
    });
  }

  abrirModalOfertas() {
    const dialogRef = this.dialog.open(ModalOfertaComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: IOferta) => {
      if (result) {
        this.ofertaSeleccionado = result;
      }
    });
  }

  abrirModalProductos() {
    const dialogRef = this.dialog.open(ModalProductoComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: IProducto) => {
      if (result) {
        this.productoSeleccionado = result;

        this.producto.precioVenta = Number(result.precio_Venta);
      }
    });
  }

  verDetalleVenta() {
    this.router.navigate(['venta/detalle-venta']);
  }

  obtenerNumeroDocumento() {
    this.servicioVenta.obtenerNuevoNumeroDocumento().subscribe({
      next: (resp: any) => {
        this.numeroDocumento = resp.data;
      }
    });
  }

  agregarProducto() {
    if (this.productoSeleccionado && this.producto.cantidad > 0) {
      if (!Number.isInteger(this.producto.cantidad)) {
        this.mostrarMensaje('La cantidad debe ser un número entero.', 'error');
        return;
      }

      if (this.producto.cantidad <= this.productoSeleccionado.stock!) {
        const precioVenta = Number(this.productoSeleccionado.precio_Venta);
        const cantidad = Number(this.producto.cantidad);
        const descuento = this.ofertaSeleccionado?.descuento ?? 0;

        const subtotal = precioVenta * cantidad;
        const montoDescuento = subtotal * (descuento / 100);
        const subtotalConDescuento = subtotal - montoDescuento;

        const productoAgregado = {
          id: this.productoSeleccionado.id_Producto,
          nombre: this.productoSeleccionado.nombre_Producto,
          precioVenta: precioVenta,
          cantidad: cantidad,
          descuento: descuento,
          subtotal: subtotalConDescuento
        };

        this.productosAgregados.push(productoAgregado);
        this.dataSource.data = [...this.productosAgregados];

        this.calcularTotal();
        this.productoSeleccionado = null;
        this.ofertaSeleccionado = null;
        this.producto.cantidad = 0;
      } else {
        this.mostrarMensaje('La cantidad supera al stock del producto.', 'error');
      }
    } else {
      this.mostrarMensaje('No se acepta cantidades negativas.', 'error');
    }
  }

  eliminarProducto(index: number) {
    this.productosAgregados.splice(index, 1);
    this.dataSource.data = [...this.productosAgregados];
    this.calcularTotal();
  }

  calcularTotal() {
    const total = this.productosAgregados.reduce(
      (acc, item) => acc + item.precioVenta * item.cantidad,
      0
    );
    const descuento = this.ofertaSeleccionado?.descuento || 0;
    const montoDescuento = total * (descuento / 100);
    const totalConDescuento = total - montoDescuento;

    this.totalSinDescuento = total;
    this.totalConDescuento = totalConDescuento;
    this.montoDescuento = montoDescuento;

    return totalConDescuento;
  }

  calcularCambio() {
    this.calcularTotal();

    if (!isNaN(this.pagaCon)) {
      if (this.pagaCon < 0) {
        this.mostrarMensaje('No se permiten valores negativos en "Paga con".', 'error');
        this.cambio = 0;
      } else {
        if (this.pagaCon < this.totalConDescuento) {
          this.mostrarMensaje('El monto ingresado en "Paga con" es insuficiente.', 'error');
          this.cambio = 0;
        } else {
          this.cambio = this.pagaCon - this.totalConDescuento;
        }
      }
    } else {
      this.mostrarMensaje('Debe ingresar un número válido en "Paga con".', 'error');
      this.cambio = 0;
    }
  }

  mostrarTotal() {
    return this.totalSinDescuento;
  }

  registrarVenta() {
    if (!this.clienteSeleccionado) {
      this.mostrarMensaje('Debe seleccionar un cliente.', 'error');
      return;
    } else if (!this.sucursalSelecionada) {
      this.mostrarMensaje('Debe seleccionar una sucursal.', 'error');
      return;
    } else if (this.productosAgregados.length === 0) {
      this.mostrarMensaje('Debe agregar al menos un producto.', 'error');
      return;
    }

    const detalles: IDetalleVenta[] = this.productosAgregados.map((p) => ({
      id_Producto: p.id,
      precio_Venta: Number(p.precioVenta),
      cantidad: p.cantidad,
      subTotal: p.subtotal,
      descuento: p.descuento
    }));

    const datosToken = this.loginServicio.obtenerDatosToken();

    const venta: IVenta = {
      id: 0,
      numero_Documento: this.numeroDocumento,
      id_Usuario: Number(datosToken?.nameid),
      id_Sucursal: this.sucursalSelecionada.id_Sucursal,
      id_Cliente: this.clienteSeleccionado.id_Cliente,
      tipo_Documento: this.tipoComprobante,
      monto_Total: this.totalSinDescuento,
      monto_Cambio: this.cambio,
      monto_Pago: Number(this.pagaCon),
      descuento: this.totalConDescuento,
      detalles: detalles
    };

    this.servicioVenta.registrar(venta).subscribe((response) => {
      if (response.isSuccess) {
        this.mostrarMensaje('¡Venta registrada exitosamente!', 'success');
        this.dialog.open(DialogoNumeroDocumentoComponent, {
          width: '400px',
          data: { numeroDocumento: this.numeroDocumento }
        });
        this.limpiar();
        this.router.navigate(['/venta']);
      } else {
        this.mostrarMensaje('Error al registrar la venta', 'error');
      }
    });
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

  limpiar() {
    this.sucursalSelecionada = null;
    this.clienteSeleccionado = null;
    this.ofertaSeleccionado = null;
    this.productoSeleccionado = null;

    this.producto = {
      precioVenta: 0,
      cantidad: 0,
      subTotal: 0,
      descuento: 0
    };

    this.tipoComprobante = 'Boleta';

    this.productosAgregados = [];
    this.dataSource.data = [];
  }
}
