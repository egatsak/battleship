import { DatabaseError } from '../helpers/errors';
import { PlayerEntity } from '../models/Player';
import { RoomEntity } from '../models/Room';
import { Player, Room } from '../types/types';

export class Database {
  private players: Player[];
  private playersIdCount: number;
  private rooms: Room[];
  private roomsIdCount: number;

  constructor() {
    this.players = [];
    this.rooms = [];
    this.playersIdCount = 0;
    this.roomsIdCount = 0;
  }

  get getRooms() {
    return this.rooms;
  }

  get getPlayers() {
    return this.players;
  }

  createPlayer(dto: Omit<Player, 'id' | 'wins'>) {
    const player = new PlayerEntity({ ...dto, wins: 0, id: ++this.playersIdCount });

    this.players.push(player);

    return player;
  }

  findPlayerById(id: number) {
    return this.players.find((item) => item.id === id) ?? null;
  }

  findPlayerByName(name: string) {
    return this.players.find((item) => item.name === name) ?? null;
  }

  deletePlayer(id: number) {
    const ind = this.players.findIndex((item) => item.id === id);

    if (ind === -1) {
      return null;
    }

    const deleted = this.players.splice(ind, 1);

    return deleted[0];
  }

  updatePlayerId(oldId: number, newId: number) {
    const playerToUpdate = this.players.find((item) => item.id === oldId);

    if (!playerToUpdate) {
      throw new DatabaseError(`Player by ID ${oldId} not found`);
    }

    playerToUpdate.id = newId;

    return playerToUpdate;
  }

  updatePlayerWins(id: number) {
    const playerToUpdate = this.players.find((item) => item.id === id);

    if (!playerToUpdate) {
      throw new DatabaseError(`Player by ID ${id} not found`);
    }

    playerToUpdate.wins = playerToUpdate.wins + 1;

    return playerToUpdate;
  }

  createRoom(dto: Omit<Room, 'id'>) {
    const room = new RoomEntity({ ...dto, id: ++this.roomsIdCount });

    this.rooms.push(room);

    return room;
  }

  findRoomById(id: number) {
    return this.rooms.find((item) => item.id === id) ?? null;
  }

  findRoomByPlayerId(playerId: number) {
    return this.rooms.find((item) => item.playerId === playerId) ?? null;
  }

  deleteRoom(id: number) {
    const ind = this.rooms.findIndex((item) => item.id === id);

    if (ind === -1) {
      return null;
    }

    const deleted = this.rooms.splice(ind, 1);

    return deleted[0];
  }
}
