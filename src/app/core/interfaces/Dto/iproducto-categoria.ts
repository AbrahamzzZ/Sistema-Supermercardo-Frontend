export interface IProductoCategoria {
  id_Producto: number;
  codigo: string;
  descripcion: string;
  nombre_Producto: string;
  id_Categoria: number;
  nombre_Categoria?: string;
  pais_Origen: string;
  stock: number;
  precio_Compra: number;
  precio_Venta: number;
  estado: boolean;
}
