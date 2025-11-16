import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentaInicioComponent } from './venta-inicio.component';

describe('VentaInicioComponent', () => {
  let component: VentaInicioComponent;
  let fixture: ComponentFixture<VentaInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VentaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
