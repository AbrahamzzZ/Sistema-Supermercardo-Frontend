import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportistaInicioComponent } from './transportista-inicio.component';

describe('TransportistaInicioComponent', () => {
  let component: TransportistaInicioComponent;
  let fixture: ComponentFixture<TransportistaInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportistaInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransportistaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
