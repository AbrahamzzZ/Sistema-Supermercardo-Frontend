import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidnebarComponent } from './sidnebar.component';

describe('SidnebarComponent', () => {
  let component: SidnebarComponent;
  let fixture: ComponentFixture<SidnebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidnebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SidnebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
