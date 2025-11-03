export interface IProducto {
  id_Producto: number;
  codigo: string;
  descripcion: string;
  nombre_Producto: string;
  id_Categoria?: number;
  pais_Origen: string;
  stock?: number | undefined;
  precio_Compra?: number;
  precio_Venta?: number;
  estado: boolean;
}
