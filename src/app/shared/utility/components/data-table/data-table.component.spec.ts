import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableComponent } from './data-table.component';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should preserve the calendar day for date-only values', () => {
    expect(component.getFechaRegistro('2026-09-02')).toBe('02/09/2026');
  });

  it('should format date-time values normally', () => {
    expect(component.getFechaRegistro('2026-09-03T23:29:33.32')).toBe('03/09/2026');
  });
});
