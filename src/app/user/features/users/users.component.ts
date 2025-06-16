import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/users/user.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Auth } from '@angular/fire/auth';
import { UserRoleEnum } from '../../../shared/models/enums';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  
    constructor(
    private router: Router,
    private _authService: AuthService,
    public userService: UserService,
    private auth: Auth,
    
  ) {
  }
  async ngOnInit(): Promise<void> {
    this.getUsers();
  }

  async getUsers() {
    const user = this._authService.getCurrentUser();
    
    if (user) {
      await this.userService.getUsers();
      
    } else {
      // Si no hay usuario, redirige al login o muestra mensaje
      this.router.navigate(['/auth/login']);
    } 
  }


  async delete(id:string) {
    // Implementar lógica de eliminación de cita
    const doctor = await this.userService.getUser(id, UserRoleEnum.doctor);

    if (doctor != undefined) {

      this._authService.createUserProfile(id, {...doctor, isActive: false})
        .then(() => {
          this.getUsers()
          alert('Doctor eliminado correctamente');
        })
        .catch((error: { message: string; }) => {
          console.error('Error al eliminar la cita:', error);
          alert('Error al eliminar la cita: ' + error.message);
        });
        
      } 
    }


  crearDoctor() {
    this.router.navigate(['users/create']); // redirige a formulario de nueva cita
  }


}
