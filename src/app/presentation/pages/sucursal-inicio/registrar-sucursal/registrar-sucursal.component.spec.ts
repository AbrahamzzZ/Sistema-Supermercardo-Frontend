import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarSucursalComponent } from './registrar-sucursal.component';

describe('RegistrarSucursalComponent', () => {
  let component: RegistrarSucursalComponent;
  let fixture: ComponentFixture<RegistrarSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarSucursalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
