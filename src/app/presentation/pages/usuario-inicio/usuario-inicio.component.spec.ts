import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioInicioComponent } from './usuario-inicio.component';

describe('UsuarioInicioComponent', () => {
  let component: UsuarioInicioComponent;
  let fixture: ComponentFixture<UsuarioInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioInicioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
