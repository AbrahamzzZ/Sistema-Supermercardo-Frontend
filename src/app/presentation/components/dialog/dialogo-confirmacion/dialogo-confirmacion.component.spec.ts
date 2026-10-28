import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogoConfirmacionComponent } from './dialogo-confirmacion.component';

describe('DialogoConfirmacionComponent', () => {
  let component: DialogoConfirmacionComponent;
  let fixture: ComponentFixture<DialogoConfirmacionComponent>;
  const dialogRef = { close: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoConfirmacionComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { mensaje: '¿Eliminar categoría?' } }
      ]
    })
      .overrideComponent(DialogoConfirmacionComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(DialogoConfirmacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes with false when canceled', () => {
    component.cerrar();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('closes with true when confirmed', () => {
    component.eliminar();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
