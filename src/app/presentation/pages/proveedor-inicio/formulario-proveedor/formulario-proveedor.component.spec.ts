import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioProveedorComponent } from './formulario-proveedor.component';

describe('FormularioProveedorComponent', () => {
  let component: FormularioProveedorComponent;
  let fixture: ComponentFixture<FormularioProveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProveedorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
