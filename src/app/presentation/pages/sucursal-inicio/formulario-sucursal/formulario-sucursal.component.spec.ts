import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioSucursalComponent } from './formulario-sucursal.component';

describe('FormularioSucursalComponent', () => {
  let component: FormularioSucursalComponent;
  let fixture: ComponentFixture<FormularioSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioSucursalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
