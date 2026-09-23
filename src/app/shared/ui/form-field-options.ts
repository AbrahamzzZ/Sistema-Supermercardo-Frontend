import { Provider } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const ERRORES_DINAMICOS: Provider = {
  provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
  useValue: { subscriptSizing: 'dynamic' }
};
