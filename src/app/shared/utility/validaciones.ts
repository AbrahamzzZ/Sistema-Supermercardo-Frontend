import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { SchemaPath, validate } from '@angular/forms/signals';

export class Validaciones {
  static soloLetras(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(control.value) ? null : { soloLetras: true };
    };
  }

  static soloLetrasSignal(path: SchemaPath<string>): void {
    validate(path, ({ value }) => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(value()) ? null : { kind: 'soloLetras', message: 'Solo debe contener letras.' };
    });
  }

  static soloNumerosSignal(path: SchemaPath<string>, cantidad = 10): void {
    validate(path, ({value}) =>{
      const regex = new RegExp(String.raw`^\d{${cantidad}}$`);
      return regex.test(value()) ? null : { kind: 'soloNumeros', message: `Debe contener exactamente ${cantidad} dígitos.` };
    })
  }

  static formatoClaveSignal(path: SchemaPath<string>): void {
    validate(path, ({ value }) => {
      const valor = value().trim();
      if (!valor) return null;
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W]{8,}$/;
      return regex.test(valor)
        ? null
        : { kind: 'formatoClave', message: 'La clave debe incluir letras, números y un carácter especial.' };
    });
  }

  static rolRequeridoSignal(path: SchemaPath<number>): void {
    validate(path, ({ value }) =>
      value() > 0 ? null : { kind: 'rolInvalido', message: 'Debe seleccionar un rol.' }
    );
  }

  static soloNumeros(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      /^\d{10}$/.test(control.value) ? null : { soloNumeros: true };
  }

  static rucValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      /^\d{13}$/.test(control.value) ? null : { rucValido: true };
  }

  static stockValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (valor === null || valor === undefined || valor === '') return { stockValido: true };
      const numero = Number(valor);
      return Number.isInteger(numero) && numero >= 0 ? null : { stockValido: true };
    };
  }

  static formatoPrecio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      /^(?:\d+|\d*\.\d{1,2})$/.test(String(control.value)) ? null : { formatoPrecio: true };
  }

  static formatoClave(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value?.trim();
      if (!valor) return null;
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W]{8,}$/;
      return regex.test(valor) ? null : { formatoClave: true };
    };
  }

  static fechaFinValida(fechaCreacion: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (!valor) return null;
      return new Date(valor) < fechaCreacion ? { fechaFinInvalida: true } : null;
    };
  }

  static rolRequerido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      control.value && control.value !== 0 ? null : { rolInvalido: true };
  }

  static productoRequerido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      control.value && control.value !== 0 ? null : { productoInvalido: true };
  }

  static categoriaRequerida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null =>
      control.value && control.value !== 0 ? null : { categoriaInvalida: true };
  }

  static coordenadaValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      if (valor === null || valor === undefined || valor === '') return { coordenadaInvalida: true };
      const numero = Number.parseFloat(String(valor));
      return Number.isNaN(numero) || numero < -180 || numero > 180 ? { coordenadaInvalida: true } : null;
    };
  }
}
