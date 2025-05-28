import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard de autenticación que verifica si el usuario está autenticado
 * y opcionalmente comprueba si tiene los roles requeridos para acceder a una ruta.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      const user = authService.getCurrentUser(); // Ya se debió haber establecido por onAuthStateChanged
      if (isLoggedIn && user) {
        const requiredRoles = route.data?.['roles'] as string[];
        if (!requiredRoles || requiredRoles.includes(user.role || '')) {
          return true;
        } else {
          router.navigate(['/access-denied']);
          return false;
        }
      }

      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};

/**
 * Guard que verifica si el usuario tiene un rol específico
 * @param roles Lista de roles permitidos para acceder a la ruta
 */
export function roleGuard(roles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // Primero verificamos directamente sin usar el observable
    const currentUser = authService.getCurrentUser();
    
    if (currentUser) {
      const userRole = currentUser.role;
      if (userRole && roles.includes(userRole)) {
        return true;
      } else {
        router.navigate(['/access-denied']);
        return false;
      }
    }
    
    // Si no hay usuario, usamos el observable
    return authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (isLoggedIn) {
          const credentials = authService.getCurrentUser();
          const userRole = credentials?.role;
          
          if (userRole && roles.includes(userRole)) {
            return true;
          } else {
            router.navigate(['/access-denied']);
            return false;
          }
        } else {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      })
    );
  };
}

/**
 * Guard que verifica si el usuario NO está autenticado.
 * Útil para rutas como login/registro que solo deben ser accesibles para usuarios no autenticados.
 */
export const notAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verificamos primero directamente sin usar el observable
  const currentUser = authService.getCurrentUser();
  
  if (currentUser) {
    router.navigate(['/home']);
    return false;
  }
  
  // Si no estamos seguros, usamos el observable
  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};