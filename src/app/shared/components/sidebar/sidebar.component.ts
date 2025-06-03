import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../../../auth/features/data-access/auth.service';
import { Router } from '@angular/router';

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
