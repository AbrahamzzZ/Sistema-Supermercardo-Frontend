import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-log',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './modal-log.component.html',
  styleUrl: './modal-log.component.scss'
})
export class ModalLogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  copy() {
    navigator.clipboard.writeText(JSON.stringify(this.data, null, 2));
  }

  download() {
    const contenido = JSON.stringify(this.data, null, 2);
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = globalThis.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `log_${this.data.id_Log}.txt`;
    a.click();

    globalThis.URL.revokeObjectURL(url);
  }
}
