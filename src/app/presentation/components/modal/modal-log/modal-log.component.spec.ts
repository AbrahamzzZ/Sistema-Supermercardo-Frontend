import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLogComponent } from './modal-log.component';

describe('ModalLogComponent', () => {
  let component: ModalLogComponent;
  let fixture: ComponentFixture<ModalLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalLogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
