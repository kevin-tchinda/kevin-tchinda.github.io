import { Routes } from '@angular/router';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'my-place',
  //   pathMatch: 'full',
  // },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/my-place/my-place.page').then( m => m.MyPlacePage)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then( m => m.AboutPage)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.page').then( m => m.ContactPage)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then( m => m.NotFoundPage)
  },
];
