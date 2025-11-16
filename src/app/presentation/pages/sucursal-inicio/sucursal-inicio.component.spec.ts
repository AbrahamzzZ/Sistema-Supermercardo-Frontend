import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalInicioComponent } from './sucursal-inicio.component';

describe('SucursalInicioComponent', () => {
  let component: SucursalInicioComponent;
  let fixture: ComponentFixture<SucursalInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SucursalInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
