import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportistaComponent } from './registro-transportista.component';

describe('TransportistaComponent', () => {
  let component: TransportistaComponent;
  let fixture: ComponentFixture<TransportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportistaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
