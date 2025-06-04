import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/features/data-access/auth.service';
import { UserService } from '../../data-access/user.service';

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
    public userService: UserService
  ) {
  }
  async ngOnInit(): Promise<void> {

    this.getUsers();
  }

  async getUsers() {
    const user = this._authService.getCurrentUser();
    console.log('Usuario actual:', user);
    console.log(this.userService.error);
    
    if (user) {
      await this.userService.obtenerUsuarios();
      
    } else {
      // Si no hay usuario, redirige al login o muestra mensaje
      this.router.navigate(['/auth/login']);
    } 
  }


  async delete(id:string) {
    // Implementar lógica de eliminación de cita
    console.log('Eliminar doctor con ID:', id);
    
    const doctor = await this.userService.obtenerUsuario(id);

    if (doctor != undefined) {

      console.log('Doctor encontrado:', doctor);
      
      this._authService.createUserProfile(id, {...doctor, isActive: false})
        .then(() => {
          this.getUsers()
          alert('Doctor eliminado correctamente');
        })
        .catch((error: { message: string; }) => {
          console.error('Error al eliminar la cita:', error);
          alert('Error al eliminar la cita: ' + error.message);
        });
        
        console.log('Eliminar doctor' + id);
      } 
    }


  crearDoctor() {
    this.router.navigate(['appointment/create']); // redirige a formulario de nueva cita
    }


}
