import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Sale } from './pages/sales/sale/sale';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'sale', component: Sale },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirige la raíz al home
  { path: '**', redirectTo: '/home' }, // Comodín por si escriben cualquier cosa mal
];