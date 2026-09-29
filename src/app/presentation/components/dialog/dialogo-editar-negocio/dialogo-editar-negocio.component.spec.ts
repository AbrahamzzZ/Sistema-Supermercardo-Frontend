import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogoEditarNegocioComponent } from './dialogo-editar-negocio.component';

describe('DialogoEditarNegocioComponent', () => {
  let component: DialogoEditarNegocioComponent;
  let fixture: ComponentFixture<DialogoEditarNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoEditarNegocioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogoEditarNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
