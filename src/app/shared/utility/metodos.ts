import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export class Metodos {
  static generarCodigo(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
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
}
