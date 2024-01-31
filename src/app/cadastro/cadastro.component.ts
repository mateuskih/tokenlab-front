import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {
  constructor(private userService: UserService) { }

  async register(username: string, password: string, confirmPassword: string): Promise<void> {
    console.log(username + ' ' + password)
    if (password !== confirmPassword) {
      alert('Error Senha invalida');
      return;
    }

    const res = await this.userService.createUser(username, password);
    if (res) {
      alert('Usuario criado com sucesso');
    } else {
      alert('Erro ao criar usuario');
    }
  }
}
