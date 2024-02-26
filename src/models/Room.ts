import { Room } from '../types/types';

export class RoomEntity implements Room {
  id: number;
  playerId: number;
  playerName: string;

  constructor({ id, playerId, playerName }: RoomEntity) {
    this.id = id;
    this.playerId = playerId;
    this.playerName = playerName;
  }
}
