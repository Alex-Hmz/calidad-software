import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;

  authService = inject(AuthService);
  private router = inject(Router);
  
  async logOut() {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);

  }
}
