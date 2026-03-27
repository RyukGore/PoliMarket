import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthorizationResponse {
    idVendedor: number;
    nombre: string;
    estaAutorizado: boolean;
    token: string;
}

@Injectable({
	providedIn: 'root',
})
export class HumanResourcesService {
	private readonly http = inject(HttpClient);
	private readonly authorizationUrl =
		'http://localhost:3001/api/polimarket/authorization';

	authorizeByNit(nit: string): Observable<AuthorizationResponse> {
		return this.http.post<AuthorizationResponse>(this.authorizationUrl, { nit });
	}
}
