import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IMenu } from '../interfaces/menu';
import { ApiResponse } from '../setting/api/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Menu';

  obtener(id: number) {
    return this.http.get<ApiResponse<IMenu[]>>(`${this.apiUrl}/${id}`);
  }
}
