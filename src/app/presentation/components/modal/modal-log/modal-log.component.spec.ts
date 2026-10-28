import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalLogComponent } from './modal-log.component';

describe('ModalLogComponent', () => {
  let component: ModalLogComponent;
  let fixture: ComponentFixture<ModalLogComponent>;
  const log = { mensaje: 'Inventario actualizado', id_Log: 42 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalLogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: log }]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('displays the injected log data as formatted JSON', () => {
    expect(component.data).toBe(log);
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain('"id_Log": 42');
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain(
      '"mensaje": "Inventario actualizado"'
    );
  });

  it('copies the complete formatted log data to the clipboard', () => {
    const writeText = vi.fn();
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    component.copy();

    expect(writeText).toHaveBeenCalledWith(JSON.stringify(log, null, 2));
  });

  it('downloads the log as a text file and revokes its object URL', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:log');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const link = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLAnchorElement);

    component.download();

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
    expect(await blob.text()).toBe(JSON.stringify(log, null, 2));
    expect(link.href).toBe('blob:log');
    expect(link.download).toBe('log_42.txt');
    expect(link.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:log');
  });
});
