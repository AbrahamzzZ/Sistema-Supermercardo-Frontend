import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogoFormularioIncompletoComponent } from '../../components/dialog/dialogo-formulario-incompleto/dialogo-formulario-incompleto.component';

export interface CanComponentDeactive {
  canDeactive: () => Observable<boolean> | boolean;
}

export const FormularioIncompleto: CanDeactivateFn<CanComponentDeactive> = (
  component: CanComponentDeactive
) => {
  const formularioValido = component.canDeactive();

  if (!formularioValido) {
    const dialogo = inject(MatDialog);
    const reference = dialogo.open(DialogoFormularioIncompletoComponent);
    return reference.afterClosed();
  }
  return true;
};
