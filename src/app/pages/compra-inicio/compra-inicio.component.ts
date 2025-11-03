import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalProveedorComponent } from '../../presentation/components/modal/modal-proveedor/modal-proveedor.component';
import { IProveedor } from '../../core/interfaces/proveedor';
import { MatDialog } from '@angular/material/dialog';
import { ITransportista } from '../../core/interfaces/transportista';
import { ModalTransportistaComponent } from '../../presentation/components/modal/modal-transportista/modal-transportista.component';
import { IProducto } from '../../core/interfaces/producto';
import { ModalProductoComponent } from '../../presentation/components/modal/modal-producto/modal-producto.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { IDetalleCompra } from '../../core/interfaces/detalle-compra';
import { ICompra } from '../../core/interfaces/compra';
import { CompraService } from '../../core/services/compra.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../core/services/login.service';
import { DialogoNumeroDocumentoComponent } from '../../presentation/components/dialog/dialogo-numero-documento/dialogo-numero-documento.component';
import { ISucursal } from '../../core/interfaces/sucursal';
import { ModalSucursalComponent } from '../../presentation/components/modal/modal-sucursal/modal-sucursal.component';
import { MaterialModule } from '../../shared/ui/material-module';

@Component({
  selector: 'app-compra-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
  ],
  templateUrl: './compra-inicio.component.html',
  styleUrl: './compra-inicio.component.scss'
})
export class CompraInicioComponent implements OnInit {
  private servicioCompra = inject(CompraService);
  private snackBar = inject(MatSnackBar);
  private loginServicio = inject(LoginService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public hoy = new Date().toISOString().substring(0, 10);
  public tipoComprobante = 'Boleta';
  public proveedorSeleccionado: IProveedor | null = null;
  public transportistaSeleccionado: ITransportista | null = null;
  public productoSeleccionado: IProducto | null = null;
  public sucursalSelecionada: ISucursal | null = null;
  public producto = { precioVenta: 0, precioCompra: 0, cantidad: 0, subTotal: 0 };
  public productosAgregados: any[] = [];
  public dataSource = new MatTableDataSource<any>();
  public columnasTabla: string[] = [
    'ID',
    'nombre',
    'precioCompra',
    'precioVenta',
    'cantidad',
    'subtotal',
    'accion'
  ];
  public numeroDocumento = '';

  ngOnInit(): void {
    this.obtenerNumeroDocumento();
  }

  abrirModalSucursales() {
    const dialogoRef = this.dialog.open(ModalSucursalComponent, {
      width: '800px'
    });

    dialogoRef.afterClosed().subscribe((result: ISucursal) => {
      if (result) {
        this.sucursalSelecionada = result;
      }
    });
  }

  abrirModalProveedores() {
    const dialogRef = this.dialog.open(ModalProveedorComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: IProveedor) => {
      if (result) {
        this.proveedorSeleccionado = result;
      }
    });
  }

  abrirModalTransportistas() {
    const dialogRef = this.dialog.open(ModalTransportistaComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe((result: ITransportista) => {
      if (result) {
        this.transportistaSeleccionado = result;
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

        this.producto.precioCompra = Number(result.precio_Compra);
        this.producto.precioVenta = Number(result.precio_Venta);
      }
    });
  }

  verDetalleCompra() {
    this.router.navigate(['compra/detalle-compra']);
  }

  obtenerNumeroDocumento() {
    this.servicioCompra.obtenerNuevoNumeroDocumento().subscribe({
      next: (resp: any) => {
        this.numeroDocumento = resp.data;
      }
    });
  }

  agregarProducto() {
    if (this.productoSeleccionado && this.producto.cantidad > 0) {
      if (
        this.producto.precioCompra >= 0 &&
        this.producto.precioVenta >= 0
      ) {
        if (!Number.isInteger(this.producto.cantidad)) {
          this.mostrarMensaje('La cantidad debe ser un número entero.', 'error');
          return;
        }

        const subtotalCalculado =
          Number(this.producto.precioCompra) * Number(this.producto.cantidad);
        const productoAgregado = {
          id: this.productoSeleccionado.id_Producto,
          nombre: this.productoSeleccionado.nombre_Producto,
          precioCompra: Number(this.producto.precioCompra),
          precioVenta: Number(this.producto.precioVenta),
          cantidad: this.producto.cantidad,
          subtotal: subtotalCalculado
        };

        this.productosAgregados.push(productoAgregado);
        this.dataSource.data = [...this.productosAgregados];

        this.productoSeleccionado = null;
        this.producto = { precioVenta: 0, precioCompra: 0, cantidad: 0, subTotal: 0 };
      } else {
        this.mostrarMensaje('El precio debe ser un número válido.', 'error');
      }
    } else {
      this.mostrarMensaje('No se acepta cantidades negativas.', 'error');
    }
  }

  eliminarProducto(index: number) {
    this.productosAgregados.splice(index, 1);
    this.dataSource.data = [...this.productosAgregados];
  }

  calcularTotal() {
    return this.productosAgregados.reduce((acc, p) => acc + p.precioCompra * p.cantidad, 0);
  }

  registrarCompra() {
    if (!this.proveedorSeleccionado) {
      this.mostrarMensaje('Debe seleccionar un proveedor.', 'error');
      return;
    } else if (!this.transportistaSeleccionado) {
      this.mostrarMensaje('Debe seleccionar un transportista.', 'error');
      return;
    } else if (!this.sucursalSelecionada) {
      this.mostrarMensaje('Debe seleccionar una sucursal.', 'error');
      return;
    } else if (this.productosAgregados.length === 0) {
      this.mostrarMensaje('Debe agregar al menos un producto.', 'error');
      return;
    }

    const detalles: IDetalleCompra[] = this.productosAgregados.map((p) => ({
      id_Producto: p.id,
      precio_Compra: Number(p.precioCompra),
      precio_Venta: Number(p.precioVenta),
      cantidad: p.cantidad,
      subTotal: p.subtotal
    }));

    const datosToken = this.loginServicio.obtenerDatosToken();

    const compra: ICompra = {
      id: 0,
      numero_Documento: this.numeroDocumento,
      id_Usuario: Number(datosToken?.nameid),
      id_Sucursal: this.sucursalSelecionada.id_Sucursal,
      id_Proveedor: this.proveedorSeleccionado.id_Proveedor,
      id_Transportista: this.transportistaSeleccionado.id_Transportista,
      tipo_Documento: this.tipoComprobante,
      monto_Total: this.calcularTotal().toFixed(2),
      detalles: detalles
    };

    this.servicioCompra.registrar(compra).subscribe((response) => {
      if (response.isSuccess) {
        this.mostrarMensaje('¡Compra registrada exitosamente!', 'success');
        this.dialog.open(DialogoNumeroDocumentoComponent, {
          width: '400px',
          data: { numeroDocumento: this.numeroDocumento }
        });
        this.limpiar();
        this.router.navigate(['/compra']);
      } else {
        this.mostrarMensaje('Error al registrar la compra', 'error');
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
    this.proveedorSeleccionado = null;
    this.transportistaSeleccionado = null;
    this.productoSeleccionado = null;

    this.producto = {
      precioVenta: 0,
      precioCompra: 0,
      cantidad: 0,
      subTotal: 0
    };

    this.tipoComprobante = 'Boleta';

    this.productosAgregados = [];
    this.dataSource.data = [];
  }
}
