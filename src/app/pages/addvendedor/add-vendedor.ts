import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HumanResourcesService } from '../../services/humanResources.service';

@Component({
  selector: 'app-add-vendedor',
  imports: [FormsModule],
  templateUrl: './add-vendedor.html',
  styleUrl: './add-vendedor.css',
})
export class AddVendedor {
  private readonly router = inject(Router);
  private readonly humanResourcesService = inject(HumanResourcesService);

  nuevoIdVendedor = '';
  nuevoNombreVendedor = '';
  readonly addVendorError = signal('');
  readonly addVendorSuccess = signal('');
  readonly addVendorLoading = signal(false);

  onNuevoIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizado = input.value.replace(/[^a-zA-Z0-9\-]/g, '');
    this.nuevoIdVendedor = sanitizado;
    input.value = sanitizado;
    this.addVendorError.set('');
    this.addVendorSuccess.set('');
  }

  onCreateVendorSubmit(): void {
    const idLimpio = this.nuevoIdVendedor.trim();
    const nombreLimpio = this.nuevoNombreVendedor.trim();

    if (!idLimpio || !nombreLimpio || this.addVendorLoading()) {
      return;
    }

    this.addVendorLoading.set(true);
    this.addVendorError.set('');
    this.addVendorSuccess.set('');

    this.humanResourcesService.addVendor(idLimpio, nombreLimpio).subscribe({
      next: () => {
        this.addVendorLoading.set(false);
        this.addVendorSuccess.set('Vendedor creado correctamente. Redirigiendo...');
        setTimeout(() => {
          void this.router.navigate(['/home']);
        }, 2000);
      },
      error: () => {
        this.addVendorLoading.set(false);
        this.addVendorError.set('No se pudo crear el vendedor. Verifica los datos e intenta nuevamente.');
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/home']);
  }
}
