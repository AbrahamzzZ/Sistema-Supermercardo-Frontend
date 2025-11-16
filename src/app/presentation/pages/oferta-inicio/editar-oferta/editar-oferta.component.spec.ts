import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarOfertaComponent } from './editar-oferta.component';

describe('EditarOfertaComponent', () => {
  let component: EditarOfertaComponent;
  let fixture: ComponentFixture<EditarOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarOfertaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
