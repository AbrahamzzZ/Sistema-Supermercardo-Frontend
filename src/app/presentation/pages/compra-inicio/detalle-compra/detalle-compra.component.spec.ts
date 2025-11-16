import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCompraComponent } from './detalle-compra.component';

describe('DetalleCompraComponent', () => {
  let component: DetalleCompraComponent;
  let fixture: ComponentFixture<DetalleCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCompraComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
