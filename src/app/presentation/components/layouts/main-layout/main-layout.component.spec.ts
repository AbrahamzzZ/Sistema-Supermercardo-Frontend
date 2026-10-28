import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginService } from '../../../../core/services/login.service';
import { MenuService } from '../../../../core/services/menu.service';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: LoginService, useValue: { obtenerDatosToken: () => null } },
        { provide: MenuService, useValue: { obtener: vi.fn() } }
      ]
    })
      .overrideComponent(MainLayoutComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
