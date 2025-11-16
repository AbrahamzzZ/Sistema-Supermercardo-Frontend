import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorInicioComponent } from './proveedor-inicio.component';

describe('ProveedorInicioComponent', () => {
  let component: ProveedorInicioComponent;
  let fixture: ComponentFixture<ProveedorInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedorInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
