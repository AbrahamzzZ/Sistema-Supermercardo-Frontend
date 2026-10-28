import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginService } from '../../../../core/services/login.service';
import { ModalInactividadComponent } from './modal-inactividad.component';

describe('ModalInactividadComponent', () => {
  let component: ModalInactividadComponent;
  let fixture: ComponentFixture<ModalInactividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInactividadComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { tiempoRestante: 60 } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: LoginService, useValue: { resetear: vi.fn() } }
      ]
    })
      .overrideComponent(ModalInactividadComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(ModalInactividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
