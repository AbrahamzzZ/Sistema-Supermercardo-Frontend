import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioCategoriaComponent } from './formulario-categoria.component';

describe('FormularioCategoriaComponent', () => {
  let component: FormularioCategoriaComponent;
  let fixture: ComponentFixture<FormularioCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioCategoriaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
