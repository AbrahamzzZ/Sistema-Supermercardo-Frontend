import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogInicioComponent } from './log-inicio.component';

describe('LogInicioComponent', () => {
  let component: LogInicioComponent;
  let fixture: ComponentFixture<LogInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogInicioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
