import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HumanResourcesService } from '../../services/humanResources.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);
  private readonly humanResourcesService = inject(HumanResourcesService);

  idVendedor = '';
  readonly authError = signal('');

  onVendedorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Solo letras, números y guión; sin caracteres especiales
    const sanitizado = input.value.replace(/[^a-zA-Z0-9\-]/g, '');
    this.idVendedor = sanitizado;
    input.value = sanitizado;
    this.authError.set('');
  }

  onSubmit(): void {
    const idLimpio = this.idVendedor.trim();

    if (!idLimpio) {
      return;
    }

    this.authError.set('');

    this.humanResourcesService.authorizeByNit(idLimpio).subscribe({
      next: (res) => {
        localStorage.setItem('polimarket_idVendedor', idLimpio);
        void this.router.navigate(['/sale']);
      },
      error: (error) => {
        if (error.status === 404) {
          this.authError.set('El ID de vendedor no está autorizado para continuar.');
          return;
        }
        else {
          this.authError.set('No se pudo validar la autorización. Intenta nuevamente.');
          console.error('No se pudo validar la autorización del ID de vendedor.', error); 
        }
      },
    });
  }
}
