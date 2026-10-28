import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogoNumeroDocumentoComponent } from './dialogo-numero-documento.component';

describe('DialogoNumeroDocumentoComponent', () => {
  let component: DialogoNumeroDocumentoComponent;
  let fixture: ComponentFixture<DialogoNumeroDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoNumeroDocumentoComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { numeroDocumento: 'DOC-001' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } }
      ]
    })
      .overrideComponent(DialogoNumeroDocumentoComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(DialogoNumeroDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
