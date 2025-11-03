import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClienteComponent } from './modal-cliente.component';

describe('ModalClienteComponent', () => {
  let component: ModalClienteComponent;
  let fixture: ComponentFixture<ModalClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalClienteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
