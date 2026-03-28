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

	authorizeByNit(idVendedor: string): Observable<any> {
		return this.http.get(
			`${this.baseUrl}/api/recursos-humanos/validar-vendedor/${idVendedor}`
		);
	}
}
