import { Component, inject } from '@angular/core';
import { MaterialModule } from '../ui/material-module';
import { NgIf } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MaterialModule, NgIf],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  private loaderService = inject(LoaderService);
  loading$ = this.loaderService.loading$;
}
