export interface IOfertaProducto {
  id_Oferta: number;
  codigo: string;
  nombre_Oferta: string;
  id_Producto: number;
  nombre_Producto: string;
  descripcion: string;
  fecha_Inicio: string;
  fecha_Fin: string;
  descuento: number;
  estado: boolean;
  fecha_Creacion: string;
}
