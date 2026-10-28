import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { vi } from 'vitest';
import { LoginService } from '../../../../core/services/login.service';
import { SidnebarComponent } from './sidnebar.component';

describe('SidnebarComponent', () => {
  let component: SidnebarComponent;
  let fixture: ComponentFixture<SidnebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidnebarComponent],
      providers: [
        { provide: Router, useValue: { url: '/home', events: EMPTY } },
        { provide: LoginService, useValue: { logout: vi.fn() } }
      ]
    })
      .overrideComponent(SidnebarComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(SidnebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
