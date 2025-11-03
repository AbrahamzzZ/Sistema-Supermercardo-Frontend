import { Component } from '@angular/core';
import { MaterialModule } from '../ui/material-module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public autor = 'Abraham Andres Farfan Sanchez';
  public telefono = '0987654321';
  public year: number = new Date().getFullYear();
}
