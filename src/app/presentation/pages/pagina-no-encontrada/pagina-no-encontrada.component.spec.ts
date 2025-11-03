import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaNoEncontradaComponent } from './pagina-no-encontrada.component';

describe('PaginaNoEncontradaComponent', () => {
  let component: PaginaNoEncontradaComponent;
  let fixture: ComponentFixture<PaginaNoEncontradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaNoEncontradaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaNoEncontradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
