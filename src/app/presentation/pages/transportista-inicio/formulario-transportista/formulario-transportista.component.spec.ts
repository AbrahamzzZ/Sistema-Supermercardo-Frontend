import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioTransportistaComponent } from './formulario-transportista.component';

describe('FormularioTransportistaComponent', () => {
  let component: FormularioTransportistaComponent;
  let fixture: ComponentFixture<FormularioTransportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioTransportistaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioTransportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
