import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompraInicioComponent } from './compra-inicio.component';

describe('CompraInicioComponent', () => {
  let component: CompraInicioComponent;
  let fixture: ComponentFixture<CompraInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CompraInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
