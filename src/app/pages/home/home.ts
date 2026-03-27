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

  nit = '';
  readonly authError = signal('');

  /**
   * Maneja la entrada del NIT, permitiendo solo números.
   * @param event Evento de entrada del NIT
   */
  onNitInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '');
    this.nit = soloNumeros;
    input.value = soloNumeros;
    this.authError.set('');
  }

  /**
   * Maneja el envío del formulario de NIT.
   * @returns void
   */
  onSubmit(): void {
    const nitLimpio = this.nit.trim();

    if (!nitLimpio || !/^\d+$/.test(nitLimpio)) {
      return;
    }

    this.authError.set('');

    this.humanResourcesService.authorizeByNit(nitLimpio).subscribe({
      next: (res) => {
        if (!res.estaAutorizado) {
          this.authError.set('El NIT no está autorizado para continuar.');
          return;
        }

        localStorage.setItem('polimarket_token', res.token);
        localStorage.setItem('polimarket_nit', nitLimpio);
        localStorage.setItem('polimarket_nombre', res.nombre);
        void this.router.navigate(['/sale']);
      },
      error: (error) => {
        this.authError.set('No se pudo validar la autorización del NIT. Intenta nuevamente.');
        console.error('No se pudo validar la autorización del NIT.', error);
      },
    });
  }
}
