import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'download',
    loadComponent: () => import('./pages/download/download.page').then( m => m.DownloadPage)
  },
  {
    path: 'playlists/:id',
    loadComponent: () => import('./pages/playlist/playlist.page').then( m => m.PlaylistPage)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then( m => m.AuthPage)
  },
];
