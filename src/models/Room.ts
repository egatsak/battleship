import { Field } from './Field';
import { Player } from './Player';

export class Room {
  constructor(
    private readonly player1: Player,
    private readonly player2: Player,
    private readonly field1: Field,
    private readonly field2: Field,
  ) {}
}
