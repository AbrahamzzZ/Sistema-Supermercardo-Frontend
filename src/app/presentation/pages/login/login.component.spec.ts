import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginService } from '../../../core/services/login.service';
import { LoginComponent } from './login.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('LoginComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<LoginComponent>>>;
  let loginService: {
    login: ReturnType<typeof vi.fn>;
    guardarToken: ReturnType<typeof vi.fn>;
    iniciarMonitoreo: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    loginService = {
      login: vi.fn(() => of({ data: { token: 'token-123' } })),
      guardarToken: vi.fn(),
      iniciarMonitoreo: vi.fn()
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };
    fixture = await createPageFixture(LoginComponent, [
      { provide: LoginService, useValue: loginService },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
    ]);
    fixture.detectChanges();
  });

  it('validates required and email fields before making a login request', () => {
    const component = fixture.componentInstance;
    component.loginForm.setValue({ correoElectronico: 'not-an-email', clave: '' });

    expect(component.loginForm.invalid).toBe(true);
    component.login();
    expect(loginService.login).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to the home page', () => {
    const component = fixture.componentInstance;
    component.loginForm.setValue({ correoElectronico: 'ana@example.com', clave: 'Clave123!' });

    component.login();

    expect(loginService.login).toHaveBeenCalledWith({
      correo_Electronico: 'ana@example.com',
      clave: 'Clave123!'
    });
    expect(loginService.guardarToken).toHaveBeenCalledWith('token-123');
    expect(loginService.iniciarMonitoreo).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
