import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NegocioService } from '../../../../core/services/negocio.service';
import { DialogoEditarNegocioComponent } from './dialogo-editar-negocio.component';

describe('DialogoEditarNegocioComponent', () => {
  let component: DialogoEditarNegocioComponent;
  let fixture: ComponentFixture<DialogoEditarNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoEditarNegocioComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: NegocioService, useValue: { editar: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } }
      ]
    })
      .overrideComponent(DialogoEditarNegocioComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(DialogoEditarNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
