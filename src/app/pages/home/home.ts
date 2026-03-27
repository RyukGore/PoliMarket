import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  nit = '';

  onNitInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '');
    this.nit = soloNumeros;
    input.value = soloNumeros;
  }

  onSubmit(): void {
    const nitLimpio = this.nit.trim();

    if (!nitLimpio || !/^\d+$/.test(nitLimpio)) {
      return;
    }

    console.log('NIT enviado:', nitLimpio);
  }
}
