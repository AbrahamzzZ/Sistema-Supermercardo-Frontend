import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegocioInicioComponent } from './negocio-inicio.component';

describe('NegocioInicioComponent', () => {
  let component: NegocioInicioComponent;
  let fixture: ComponentFixture<NegocioInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegocioInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NegocioInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
