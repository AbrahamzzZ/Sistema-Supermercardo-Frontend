import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOfertaComponent } from './modal-oferta.component';

describe('ModalOfertaComponent', () => {
  let component: ModalOfertaComponent;
  let fixture: ComponentFixture<ModalOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOfertaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
