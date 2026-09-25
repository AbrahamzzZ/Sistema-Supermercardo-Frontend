import { Provider } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

/**
 * Reserva siempre el espacio del mensaje de error debajo de cada campo.
 * Así, al aparecer un error el campo no crece ni empuja a los demás.
 */
export const ESPACIO_FIJO_ERRORES: Provider = {
  provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
  useValue: { subscriptSizing: 'fixed' }
};
