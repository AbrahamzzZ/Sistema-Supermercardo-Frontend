import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IRol } from '../interfaces/rol';
import { ApiResponse } from '../setting/api/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Rol';

  lista() {
    return this.http.get<ApiResponse<IRol[]>>(this.apiUrl);
  }
}
