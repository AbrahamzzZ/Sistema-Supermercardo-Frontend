import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCategoriaComponent } from './registro-categoria.component';

describe('RegistroCategoriaComponent', () => {
  let component: RegistroCategoriaComponent;
  let fixture: ComponentFixture<RegistroCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroCategoriaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
