import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoFormularioIncompletoComponent } from './dialogo-formulario-incompleto.component';

describe('DialogoFormularioIncompletoComponent', () => {
  let component: DialogoFormularioIncompletoComponent;
  let fixture: ComponentFixture<DialogoFormularioIncompletoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoFormularioIncompletoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogoFormularioIncompletoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
