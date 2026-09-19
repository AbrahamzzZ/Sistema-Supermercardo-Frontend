import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login-layout',
  imports: [RouterOutlet],
  templateUrl: './login-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login-layout.component.scss'
})
export class LoginLayoutComponent {}
