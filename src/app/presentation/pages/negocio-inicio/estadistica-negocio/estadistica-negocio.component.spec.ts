import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaNegocioComponent } from './estadistica-negocio.component';

describe('EstadisticaNegocioComponent', () => {
  let component: EstadisticaNegocioComponent;
  let fixture: ComponentFixture<EstadisticaNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticaNegocioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EstadisticaNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
