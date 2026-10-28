import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PaginaNoEncontradaComponent } from './pagina-no-encontrada.component';

describe('PaginaNoEncontradaComponent', () => {
  let fixture: ComponentFixture<PaginaNoEncontradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaNoEncontradaComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaNoEncontradaComponent);
    fixture.detectChanges();
  });

  it('provides a home link for returning from an invalid route', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.btn-go-home');

    expect(link.textContent?.trim()).toBe('IR AL HOME');
    expect(link.getAttribute('href')).toBe('/home');
  });
});
