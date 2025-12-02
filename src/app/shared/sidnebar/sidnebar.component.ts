import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IMenu } from '../../core/interfaces/menu';
import { MaterialModule } from '../ui/material-module';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidnebar',
  standalone: true,
  imports: [MaterialModule, RouterLink],
  templateUrl: './sidnebar.component.html',
  styleUrl: './sidnebar.component.scss'
})
export class SidnebarComponent {
  @Input() menus: IMenu[] = [];
  @Input() nombreUsuario = '';
  @Input() tipoUsuario = '';
  @Input() isCollapsed = true;
  @Output() toggle = new EventEmitter<void>();
  private readonly router = inject(Router);
  
  toggleSidebar() {
    this.toggle.emit();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
