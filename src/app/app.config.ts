import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';
import { LoaderInterceptor } from './core/interceptor/loader.interceptor';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { environment as ENV } from '../../environments/environment';

function loadGoogleMaps() {
  return async () => {
    try {
      setOptions({
        key: ENV.API_GOOGLE_MAPS
      });
      await importLibrary('maps');
    } catch (error: unknown) {
      console.error('Error cargando Google Maps', error);
      throw error;
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    {
      provide: APP_INITIALIZER,
      useFactory: loadGoogleMaps,
      multi: true
    }
  ]
};