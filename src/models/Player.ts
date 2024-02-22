import { Player } from '../types/types';

export class PlayerEntity implements Player {
  id: number;
  name: string;
  password: string;
  wins: number;

  constructor({ name, id, password, wins = 0 }: Player) {
    this.name = name;
    this.id = id;
    this.password = password;
    this.wins = wins;
  }
}
