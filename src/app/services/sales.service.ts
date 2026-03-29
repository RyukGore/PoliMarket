import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-base-url.token';
import { SaleRequest } from '../models/sale-request.model';
import { ProductStock } from '../models/product-stock.model';
import { SaleHistory } from '../models/sale-history.model';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Obtiene la lista de productos disponibles para la venta.
   * @returns Observable con la lista de productos disponibles.
   */
  productsStock(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(`${this.baseUrl}/api/ventas/listar-productos-disponibles`);
  }

  /**
   * Obtiene la lista de ventas realizadas.
   * @returns Observable con la lista de ventas.
   */
  sales(): Observable<SaleHistory[]> {
    return this.http.get<SaleHistory[]>(`${this.baseUrl}/api/ventas/listar-ventas`);
  }

  /**
   * Crea una nueva venta.
   * @param sale Objeto con los datos de la venta a crear.
   * @returns Observable con la respuesta de la creación de la venta.
   */
  insertSale(sale: SaleRequest): Observable<void> {
    return this.http
      .post(`${this.baseUrl}/api/ventas/crear-venta`, sale, { responseType: 'text' })
      .pipe(map(() => undefined));
  }
}
