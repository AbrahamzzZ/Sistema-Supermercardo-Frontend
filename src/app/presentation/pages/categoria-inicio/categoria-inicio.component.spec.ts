import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaInicioComponent } from './categoria-inicio.component';

describe('CategoriaInicioComponent', () => {
  let component: CategoriaInicioComponent;
  let fixture: ComponentFixture<CategoriaInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
