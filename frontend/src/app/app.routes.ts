import { Routes } from '@angular/router';
import { authGuard, responsableGuard, usineGuard } from './core/auth.guard';
import { Login } from './pages/login';
import { Layout } from './pages/layout';
import { TableauDeBordPage } from './pages/tableau-de-bord';
import { StockPage } from './pages/stock';
import { VentesPage } from './pages/ventes';
import { TransfertsPage } from './pages/transferts';
import { UsinePage } from './pages/usine';
import { CataloguePage } from './pages/catalogue';
import { UtilisateursPage } from './pages/utilisateurs';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', component: TableauDeBordPage },
      { path: 'stock', component: StockPage },
      { path: 'ventes', component: VentesPage },
      { path: 'transferts', component: TransfertsPage, canActivate: [responsableGuard] },
      { path: 'usine', component: UsinePage, canActivate: [usineGuard] },
      { path: 'catalogue', component: CataloguePage },
      { path: 'equipe', component: UtilisateursPage, canActivate: [responsableGuard] },
    ],
  },
  { path: '**', redirectTo: '' },
];
