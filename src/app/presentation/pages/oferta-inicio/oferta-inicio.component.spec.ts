import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertaInicioComponent } from './oferta-inicio.component';

describe('OfertaInicioComponent', () => {
  let component: OfertaInicioComponent;
  let fixture: ComponentFixture<OfertaInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertaInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OfertaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
