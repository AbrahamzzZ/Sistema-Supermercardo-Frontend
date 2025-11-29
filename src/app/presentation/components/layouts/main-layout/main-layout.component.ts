import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidnebarComponent } from '../../../../shared/sidnebar/sidnebar.component';
import { MatSidenav } from '@angular/material/sidenav';
import { IMenu } from '../../../../core/interfaces/menu';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { LoginService } from '../../../../core/services/login.service';
import { MenuService } from '../../../../core/services/menu.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SidnebarComponent, MaterialModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private loginServicio = inject(LoginService);
  private menuServicio = inject(MenuService);
  isCollapsed = true;
  nombreUsuario = "";
  tipoUsuario = "";
  menus: IMenu[] = [];

  ngOnInit() {
    const datosToken = this.loginServicio.obtenerDatosToken();

    if (datosToken) {
      this.nombreUsuario = datosToken.unique_name;
      this.tipoUsuario = datosToken.role;
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}