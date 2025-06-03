import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/features/data-access/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private _router = inject(Router);
  authService = inject(AuthService);
  @Output() toggleSidebar = new EventEmitter<void>();


  onToggleSidebar() {
    this.toggleSidebar.emit();
  }



  goToLogin() {
    this._router.navigate(['/auth/login'], { queryParams: { returnUrl: this._router.url } });
  }
}
