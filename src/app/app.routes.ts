import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirige la raíz al home
  { path: '**', redirectTo: '/home' } // Comodín por si escriben cualquier cosa mal
];