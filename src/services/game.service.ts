/* eslint-disable @typescript-eslint/no-unused-vars */
import { Database } from '../db/db';
import { Game } from '../models/Game';
import { Player, Room } from '../types/types';

export class GameService {
  db: Database;
  constructor() {
    this.db = new Database();
  }

  login(playerDto: Omit<Player, 'id'>) {
    const player = this.db.findPlayerByName(playerDto.name);

    if (!player) {
      const newPlayer = this.db.createPlayer(playerDto);
      return newPlayer;
    }

    return player;
  }

  createRoom(playerId: number) {
    const player = this.db.findPlayerById(playerId);

    if (!player) {
      throw new Error('Player not found');
    }

    const existingRoom = this.db.findRoomByPlayerId(playerId);

    if (existingRoom) {
      throw new Error('Room already exists');
    }

    const newRoomDto = {
      playerId,
      playerName: player.name,
    } satisfies Omit<Room, 'id'>;

    const createdRoom = this.db.createRoom(newRoomDto);

    return createdRoom;
  }

  joinRoom(playerId: number, roomId: number) {
    const room = this.db.findRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.playerId === playerId) return;

    const player = this.db.findPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    this.db.deleteRoom(roomId);

    // TODO create new game

    const game = new Game();
  }

  logout(playerId: number) {
    const room = this.db.findRoomByPlayerId(playerId);
    if (room) {
      this.db.deleteRoom(room.id);
    }

    // TODO close games, surrender, etc
  }

  // TODO singleplayer
}
