// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://192.168.129.30:3000', // URL de l'API en développement
  meilisearchUrl: 'http://127.0.0.1:7700', // URL de Meilisearch en développement
  meilisearchApiKey: '6421204843cd99fdfdedc8d125167d91a3988ba29464c75e929233575be6c6cb'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
