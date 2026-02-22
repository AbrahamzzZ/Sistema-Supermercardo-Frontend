import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaSucursalComponent } from './mapa-sucursal.component';

describe('MapaSucursalComponent', () => {
  let component: MapaSucursalComponent;
  let fixture: ComponentFixture<MapaSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaSucursalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapaSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
