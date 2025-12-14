import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IaChatComponent } from './ia-chat.component';

describe('IaChatComponent', () => {
  let component: IaChatComponent;
  let fixture: ComponentFixture<IaChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IaChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IaChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
