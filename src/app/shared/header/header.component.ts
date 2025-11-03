import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../core/services/login.service';
import { MenuService } from '../../core/services/menu.service';
import { IMenu } from '../../core/interfaces/menu';
import { NgClass } from '@angular/common';
import { MaterialModule } from '../ui/material-module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule, RouterLink, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public nombreUsuario = '';
  public menus: IMenu[] = [];
  private router = inject(Router);
  private loginServicio = inject(LoginService);
  private menuServicio = inject(MenuService);
  public menuAbierto = false;


  ngOnInit(): void {
    const datosToken = this.loginServicio.obtenerDatosToken();

    if (datosToken) {
      this.nombreUsuario = datosToken.unique_name;
      const idUsuario = datosToken.nameid;

      this.menuServicio.obtener(idUsuario).subscribe({
        next: (data) => {
          this.menus = data;
        },
        error: (err) => {
          console.error('Error al cargar los menús:', err);
        }
      });
    }
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
    this.loginServicio.logout();
  }
}
