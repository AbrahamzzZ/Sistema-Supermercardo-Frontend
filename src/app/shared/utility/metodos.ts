import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export class Metodos {
  
  static generarCodigo(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const numero = 10000 + (array[0] % 90000);
    return numero.toString();
  }

  static base64AImagen(base64: string): string {
    const tipos: [string, string][] = [
      ['/9j/', 'image/jpeg'],
      ['iVBORw0KGgo', 'image/png'],
      ['R0lGOD', 'image/gif'],
      ['UklGR', 'image/webp'],
      ['Qk', 'image/bmp'],
      ['PHN2Zy', 'image/svg+xml'], // <svg
      ['PD94bWwg', 'image/svg+xml'] // <?xml
    ];
    const mime = tipos.find(([prefijo]) => base64.startsWith(prefijo))?.[1] ?? 'image/png';
    return `data:${mime};base64,${base64}`;
  }

  static getFechaCreacion(): string {
    const fechaObj = new Date().toISOString();
    return fechaObj;
  }

  static exportarExcel(nombreArchivo: string, datos: any[], columnas: string[]) {
    const ws = XLSX.utils.json_to_sheet(datos, { header: columnas });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(data, `${nombreArchivo}.xlsx`);
  }

  static async exportarExcelConImagenes(nombreArchivo: string, columnas: { header: string; key: string; width?: number }[],
    datos: Record<string, unknown>[], claveImagen: string, tamanoImagen = 60): Promise<void> {
    const exceljs: any = await import('exceljs');
    const Workbook = exceljs.Workbook ?? exceljs.default.Workbook;

    const libro = new Workbook();
    const hoja = libro.addWorksheet(nombreArchivo);
    hoja.columns = columnas;
    hoja.getRow(1).font = { bold: true };

    const indiceImagen = columnas.findIndex((c) => c.key === claveImagen);

    for (const [i, fila] of datos.entries()) {
      const src = fila[claveImagen];
      const row = hoja.addRow({ ...fila, [claveImagen]: '' });
      row.alignment = { vertical: 'middle' };

      if (indiceImagen < 0 || typeof src !== 'string' || !src) continue;

      const png = await this.imagenAPng(src, tamanoImagen);
      if (!png) continue;

      row.height = tamanoImagen * 0.75 + 6;
      const idImagen = libro.addImage({ base64: png, extension: 'png' });
      hoja.addImage(idImagen, {
        tl: { col: indiceImagen + 0.1, row: i + 1 + 0.05 },
        ext: { width: tamanoImagen, height: tamanoImagen }
      });
    }

    const buffer = await libro.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${nombreArchivo}.xlsx`);
  }

  private static imagenAPng(src: string, tamano: number): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = tamano;
        canvas.height = tamano;
        const ctx = canvas.getContext('2d');
        const ancho = img.naturalWidth || tamano;
        const alto = img.naturalHeight || tamano;
        if (!ctx) return resolve(null);

        const escala = Math.min(tamano / ancho, tamano / alto);
        const w = ancho * escala;
        const h = alto * escala;
        ctx.drawImage(img, (tamano - w) / 2, (tamano - h) / 2, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
}
