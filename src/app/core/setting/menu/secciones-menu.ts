import { IMenu } from '../../interfaces/menu';

export interface ISeccionMenu {
  nombre: string;
  menus: IMenu[];
}

export const SECCIONES_MENU: { nombre: string; rutas: string[] }[] = [
  { nombre: 'General', rutas: ['home', 'negocio', 'sucursal', 'usuario'] },
  { nombre: 'Operaciones', rutas: ['compra', 'venta', 'oferta'] },
  { nombre: 'Catálogo', rutas: ['producto', 'categoria'] },
  { nombre: 'Contactos', rutas: ['cliente', 'proveedor', 'transportista'] },
  { nombre: 'Sistema', rutas: ['log'] }
];

export const SECCION_OTROS = 'Otros';
export function obtenerRutaBase(url: string): string {
  return url.split(/[?#]/)[0].replace(/^\/+/, '').split('/')[0].toLowerCase();
}

export function obtenerSeccionDeRuta(url: string): string {
  const ruta = obtenerRutaBase(url);
  return SECCIONES_MENU.find((s) => s.rutas.includes(ruta))?.nombre ?? SECCION_OTROS;
}

export function agruparMenusPorSeccion(menus: IMenu[]): ISeccionMenu[] {
  const posicion = (menu: IMenu) => {
    const ruta = obtenerRutaBase(menu.urlMenu);
    for (const seccion of SECCIONES_MENU) {
      const indice = seccion.rutas.indexOf(ruta);
      if (indice !== -1) return indice;
    }
    return Number.MAX_SAFE_INTEGER;
  };

  const nombres = [...SECCIONES_MENU.map((s) => s.nombre), SECCION_OTROS];

  return nombres
    .map((nombre) => ({nombre, menus: menus.filter((m) => obtenerSeccionDeRuta(m.urlMenu) === nombre).sort((a, b) => posicion(a) - posicion(b))})).filter((s) => s.menus.length > 0);
}
