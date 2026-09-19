import { Component, inject } from '@angular/core';

import { LoaderService } from '../../../../core/services/loader.service';
import { MaterialModule } from '../../../ui/material-module';


@Component({
    selector: 'app-loader',
    imports: [MaterialModule],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  private readonly loaderService = inject(LoaderService);
  loading$ = this.loaderService.loading$;
}
