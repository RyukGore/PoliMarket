import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';

@Injectable({
  providedIn: 'root',
})
export class HumanResourcesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Autoriza a un vendedor por su Identificador.
   * @param idVendedor El ID del vendedor a autorizar.
   * @returns Observable con la respuesta de la autorización.
   */
  authorizeByNit(idVendedor: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/recursos-humanos/validar-vendedor/${idVendedor}`);
  }
}
