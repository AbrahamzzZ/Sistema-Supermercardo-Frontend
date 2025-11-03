import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInactividadComponent } from './modal-inactividad.component';

describe('ModalInactividadComponent', () => {
  let component: ModalInactividadComponent;
  let fixture: ComponentFixture<ModalInactividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInactividadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInactividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
