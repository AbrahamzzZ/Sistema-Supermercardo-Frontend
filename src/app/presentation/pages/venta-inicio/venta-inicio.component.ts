import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { IProducto } from '../../../core/interfaces/producto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaService } from '../../../core/services/venta.service';
import { ModalClienteComponent } from '../../components/modal/modal-cliente/modal-cliente.component';
import { ICliente } from '../../../core/interfaces/cliente';
import { ModalProductoComponent } from '../../components/modal/modal-producto/modal-producto.component';
import { OfertaService } from '../../../core/services/oferta.service';
import { IOfertaProducto } from '../../../core/interfaces/Dto/ioferta-producto';
import { Router } from '@angular/router';
import { IVenta } from '../../../core/interfaces/venta';
import { CurrencyPipe } from '@angular/common';
import { DialogoNumeroDocumentoComponent } from '../../components/dialog/dialogo-numero-documento/dialogo-numero-documento.component';
import { ModalSucursalComponent } from '../../components/modal/modal-sucursal/modal-sucursal.component';
import { ISucursal } from '../../../core/interfaces/sucursal';
import { MaterialModule } from '../../../shared/ui/material-module';
import { MatPaginator } from '@angular/material/paginator';
import { IErrorHttp } from '../../../core/interceptor/error.interceptor';

interface ItemCarrito {
  id: number;
  nombre: string;
  precioVenta: number;
  cantidad: number;
  descuento: number;
  subtotal: number;
}

function fechaLocalHoy(): string {
  const d = new Date();
  const dosDigitos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

@Component({
  selector: 'app-venta-inicio',
  imports: [MaterialModule, FormsModule, CurrencyPipe],
  templateUrl: './venta-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './venta-inicio.component.scss'
})
export class VentaInicioComponent implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly servicioVenta = inject(VentaService);
  private readonly ofertaServicio = inject(OfertaService);
  private readonly snackBar = inject(MatSnackBar);
  public hoy = fechaLocalHoy();
  public tipoComprobante = 'Boleta';
  public clienteSeleccionado: ICliente | null = null;
  public ofertaAplicada: IOfertaProducto | null = null;
  public productoSeleccionado: IProducto | null = null;
  public sucursalSelecionada: ISucursal | null = null;
  public producto = { precioVenta: 0, cantidad: 0, subTotal: 0, descuento: 0 };
  public productosAgregados: ItemCarrito[] = [];
  public dataSource = new MatTableDataSource<ItemCarrito>();
  public columnasTabla: string[] = [
    'ID',
    'nombre',
    'precioVenta',
    'cantidad',
    'subtotal',
    'descuento',
    'accion'
  ];

  public numeroDocumento = '';
  public totalSinDescuento = 0;
  public pagaCon = 0;
  public cambio = 0;
  public totalConDescuento = 0;
  public montoDescuento = 0;
  public registrando = false;
  private ofertas: IOfertaProducto[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.obtenerNumeroDocumento();
    this.cargarOfertas();
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

  abrirModalProductos() {
    const dialogRef = this.dialog.open(ModalProductoComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: IProducto) => {
      if (result) {
        this.productoSeleccionado = result;

        this.producto.precioVenta = Number(result.precio_Venta);
        this.ofertaAplicada = this.ofertaVigente(result.id_Producto);

        if (this.ofertaAplicada) {
          this.mostrarMensaje(
            `Oferta "${this.ofertaAplicada.nombre_Oferta}": ${this.ofertaAplicada.descuento}% de descuento en "${result.nombre_Producto}".`,
            'oferta'
          );
        }
      }
    });
  }

  cargarOfertas() {
    this.ofertaServicio.lista().subscribe({
      next: (resp) => {
        this.ofertas = resp.data ?? [];
      },
      error: () => {
        this.ofertas = [];
      }
    });
  }

  ofertaVigente(idProducto: number): IOfertaProducto | null {
    const vigentes = this.ofertas.filter(
      (oferta) =>
        oferta.id_Producto === idProducto &&
        oferta.estado &&
        oferta.fecha_Inicio.substring(0, 10) <= this.hoy &&
        this.hoy <= oferta.fecha_Fin.substring(0, 10)
    );

    return vigentes.reduce<IOfertaProducto | null>(
      (mejor, oferta) => (!mejor || oferta.descuento > mejor.descuento ? oferta : mejor),
      null
    );
  }

  verDetalleVenta() {
    this.router.navigate(['venta/detalle-venta']);
  }

  obtenerNumeroDocumento() {
    this.servicioVenta.obtenerNuevoNumeroDocumento().subscribe({
      next: (resp) => {
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

      const productoExistente = this.productosAgregados.find(
        (item) => item.id === this.productoSeleccionado?.id_Producto
      );
      const cantidadExistente = productoExistente?.cantidad ?? 0;
      const cantidad = Number(this.producto.cantidad);

      if (cantidadExistente + cantidad <= this.productoSeleccionado.stock!) {
        const precioVenta = Number(this.productoSeleccionado.precio_Venta);
        const descuento = this.ofertaVigente(this.productoSeleccionado.id_Producto)?.descuento ?? 0;

        if (productoExistente) {
          const nuevaCantidad = cantidadExistente + cantidad;
          const subtotal = productoExistente.precioVenta * nuevaCantidad;

          productoExistente.cantidad = nuevaCantidad;
          productoExistente.subtotal = this.redondearDinero(
            subtotal * (1 - productoExistente.descuento / 100)
          );
        } else {
          const subtotal = precioVenta * cantidad;
          const montoDescuento = subtotal * (descuento / 100);

          this.productosAgregados.push({
            id: this.productoSeleccionado.id_Producto,
            nombre: this.productoSeleccionado.nombre_Producto,
            precioVenta,
            cantidad,
            descuento,
            subtotal: this.redondearDinero(subtotal - montoDescuento)
          });
        }

        this.dataSource.data = [...this.productosAgregados];

        this.calcularTotal();
        this.productoSeleccionado = null;
        this.ofertaAplicada = null;
        this.producto.cantidad = 0;
        this.producto.precioVenta = 0;
      } else {
        this.mostrarMensaje('La cantidad acumulada supera al stock del producto.', 'error');
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
    const total = this.redondearDinero(
      this.productosAgregados.reduce(
        (acc, item) => acc + Number(item.precioVenta) * Number(item.cantidad),
        0
      )
    );
    const totalConDescuento = this.redondearDinero(
      this.productosAgregados.reduce((acc, item) => acc + Number(item.subtotal), 0)
    );
    const montoDescuento = this.redondearDinero(total - totalConDescuento);

    this.totalSinDescuento = total;
    this.totalConDescuento = totalConDescuento;
    this.montoDescuento = montoDescuento;

    const pago = Number(this.pagaCon);
    this.cambio = pago >= totalConDescuento ? this.redondearDinero(pago - totalConDescuento) : 0;

    return totalConDescuento;
  }

  private redondearDinero(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
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
          this.cambio = this.redondearDinero(this.pagaCon - this.totalConDescuento);
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

    this.calcularTotal();
    if (!(Number(this.pagaCon) >= this.totalConDescuento)) {
      this.mostrarMensaje('El monto ingresado en "Paga con" es insuficiente.', 'error');
      return;
    }

    if (this.registrando) {
      return;
    }

    const venta: IVenta = {
      id_Sucursal: this.sucursalSelecionada.id_Sucursal,
      id_Cliente: this.clienteSeleccionado.id_Cliente,
      tipo_Documento: this.tipoComprobante,
      monto_Pago: Number(this.pagaCon),
      detalles: this.productosAgregados.map((p) => ({
        id_Producto: p.id,
        cantidad: p.cantidad
      }))
    };

    this.registrando = true;
    this.servicioVenta.registrar(venta).subscribe({
      next: (response) => {
        this.registrando = false;

        if (!response.isSuccess) {
          this.mostrarMensaje(response.message || 'No se pudo registrar la venta.', 'error');
          return;
        }

        const registrada = response.data;
        this.mostrarMensaje(
          `Venta registrada. Total cobrado: $${registrada.monto_Total.toFixed(2)} — Cambio: $${registrada.monto_Cambio.toFixed(2)}`,
          'success'
        );
        this.dialog.open(DialogoNumeroDocumentoComponent, {
          width: '400px',
          data: { numeroDocumento: registrada.numero_Documento }
        });
        this.limpiar();
        this.obtenerNumeroDocumento();
        this.router.navigate(['/venta']);
      },
      error: (err: IErrorHttp) => {
        this.registrando = false;
        this.mostrarMensaje(err?.message || 'No se pudo registrar la venta.', 'error');
      }
    });
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'oferta' = 'success') {
    const className =
      tipo === 'success'
        ? 'success-snackbar'
        : tipo === 'oferta'
          ? 'oferta-snackbar'
          : 'error-snackbar';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: tipo === 'error' ? 6000 : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }

  limpiar() {
    this.sucursalSelecionada = null;
    this.clienteSeleccionado = null;
    this.ofertaAplicada = null;
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
    this.totalSinDescuento = 0;
    this.totalConDescuento = 0;
    this.montoDescuento = 0;
    this.pagaCon = 0;
    this.cambio = 0;
  }
}
