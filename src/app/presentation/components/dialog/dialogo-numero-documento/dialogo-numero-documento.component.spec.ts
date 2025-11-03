import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoNumeroDocumentoComponent } from './dialogo-numero-documento.component';

describe('DialogoNumeroDocumentoComponent', () => {
  let component: DialogoNumeroDocumentoComponent;
  let fixture: ComponentFixture<DialogoNumeroDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoNumeroDocumentoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogoNumeroDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
