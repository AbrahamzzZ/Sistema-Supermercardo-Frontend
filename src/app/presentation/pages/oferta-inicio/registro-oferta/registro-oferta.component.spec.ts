import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroOfertaComponent } from './registro-oferta.component';

describe('RegistroOfertaComponent', () => {
  let component: RegistroOfertaComponent;
  let fixture: ComponentFixture<RegistroOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroOfertaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
