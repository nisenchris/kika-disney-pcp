import { Routes } from '@angular/router';

import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
    title: 'LaunchDarkly Demo Login',
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.component'),
    title: 'Chat',
  },
  ...errorRoute,
];

export default routes;
