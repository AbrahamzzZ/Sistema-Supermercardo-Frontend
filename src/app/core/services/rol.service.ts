import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IRol } from '../interfaces/rol';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Rol';

  lista() {
    return this.http.get<IRol[]>(this.apiUrl);
  }
}
