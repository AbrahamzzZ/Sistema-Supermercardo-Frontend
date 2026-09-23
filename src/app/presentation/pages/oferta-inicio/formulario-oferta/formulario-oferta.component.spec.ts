import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioOfertaComponent } from './formulario-oferta.component';

describe('FormularioOfertaComponent', () => {
  let component: FormularioOfertaComponent;
  let fixture: ComponentFixture<FormularioOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioOfertaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
