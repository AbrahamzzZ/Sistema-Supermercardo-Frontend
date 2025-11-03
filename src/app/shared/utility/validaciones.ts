import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class Validaciones {
  static soloLetras(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(control.value) ? null : { soloLetras: true };
    };
  }

  static soloNumeros(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^\d{10}$/;
      return regex.test(control.value) ? null : { soloNumeros: true };
    };
  }

  static rucValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^\d{13}$/;
      return regex.test(control.value) ? null : { rucValido: true };
    };
  }

  static stockValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return { stockValido: true }; // Evita valores vacíos
      }
      const valor = Number(control.value);
      return Number.isInteger(valor) && valor >= 0 ? null : { stockValido: true };
    };
  }

  static formatoPrecio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^(?:\d+|\d*\.\d{1,2})$/; // Permite enteros o hasta 2 decimales
      return regex.test(control.value) ? null : { formatoPrecio: true };
    };
  }

  static formatoClave(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value?.trim();

      if (!valor) {
        return null;
      }
      
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W]{8,}$/
      return regex.test(valor) ? null : { formatoClave: true };
    };
  }

  static fechaFinValida(fechaCreacion: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const fechaFin = new Date(control.value);
      const fechaActual = new Date(fechaCreacion);

      // Validar que la fecha fin sea posterior a la fecha actual
      if (fechaFin < fechaActual) {
        return { fechaFinInvalida: true };
      }

      return null;
    };
  }

  static rolRequerido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value && control.value !== 0 ? null : { rolInvalido: true };
    };
  }

  static productoRequerido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value && control.value !== 0 ? null : { productoInvalido: true };
    };
  }

  static categoriaRequerida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value && control.value !== 0 ? null : { categoriaInvalida: true };
    };
  }

  static coordenadaValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;

      if (valor === null || valor === undefined || valor === '') {
        return { coordenadaInvalida: true };
      }

      const numero = parseFloat(valor);
      if (isNaN(numero)) {
        return { coordenadaInvalida: true };
      }

      if (numero < -180 || numero > 180) {
        return { coordenadaInvalida: true };
      }

      return null;
    };
  }
}
