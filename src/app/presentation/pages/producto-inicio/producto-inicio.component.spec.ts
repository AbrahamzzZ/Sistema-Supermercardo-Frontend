import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoInicioComponent } from './producto-inicio.component';

describe('ProductoInicioComponent', () => {
  let component: ProductoInicioComponent;
  let fixture: ComponentFixture<ProductoInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
