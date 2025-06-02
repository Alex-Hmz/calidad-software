import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/features/data-access/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService)
  private _router = inject(Router);

  async logOut() {
    await this.authService.logout();
  }

  goToLogin() {
    this._router.navigate(['/auth/login'], { queryParams: { returnUrl: this._router.url } });
  }
}
