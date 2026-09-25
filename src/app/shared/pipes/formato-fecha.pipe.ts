import { Pipe, PipeTransform } from '@angular/core';
import { Metodos } from '../utility/metodos';

@Pipe({
  name: 'formatoFecha',
  standalone: true
})
export class FormatoFechaPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    return Metodos.formatearFecha(value);
  }
}
