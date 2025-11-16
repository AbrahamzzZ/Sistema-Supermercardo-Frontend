import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTransportistaComponent } from './editar-transportista.component';

describe('EditarTransportistaComponent', () => {
  let component: EditarTransportistaComponent;
  let fixture: ComponentFixture<EditarTransportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTransportistaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarTransportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
