import { Database } from '../db/db';
import { Game } from '../models/Game';
import { Ship } from '../models/Ship';
import {
  GameNotFoundError,
  IncorrectPasswordError,
  PlayerNotFoundError,
  RoomAlreadyExistsError,
  RoomNotFoundError,
} from '../helpers/errors';
import { Position, RegData, Room, ShipData } from '../types/types';
import { BOT_ID } from '../constants/constants';

export class GameService {
  db: Database;
  private _games = new Map<number, Game>();
  private _gameCounter: number = 0;

  constructor() {
    this.db = new Database();
  }

  login(playerDto: RegData, contextId: number) {
    const player = this.db.findPlayerByName(playerDto.name);

    if (!player) {
      const newPlayer = this.db.createPlayer(playerDto);
      return newPlayer;
    }

    if (player.password !== playerDto.password) {
      throw new IncorrectPasswordError('Authentication error');
    }

    const updatedPlayer = this.db.updatePlayerId(player.id, contextId);
    return updatedPlayer;
  }

  createRoom(playerId: number) {
    const player = this.db.findPlayerById(playerId);

    if (!player) {
      throw new PlayerNotFoundError(playerId);
    }

    const existingRoom = this.db.findRoomByPlayerId(playerId);

    if (existingRoom) {
      throw new RoomAlreadyExistsError(existingRoom.id);
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
      throw new RoomNotFoundError(roomId);
    }

    if (room.playerId !== playerId) {
      const player = this.db.findPlayerById(playerId);

      if (!player) {
        throw new PlayerNotFoundError(playerId);
      }

      this.db.deleteRoom(roomId);

      const game = new Game({ randomId: ++this._gameCounter, players: [room.playerId, playerId] });

      this._games.set(game.id, game);

      return game;
    }
  }

  addShips(gameId: number, playerId: number, ships: ShipData[]) {
    const game = this._games.get(gameId);

    if (!game) {
      throw new GameNotFoundError(gameId);
    }

    game.placeShips(
      playerId,
      ships.map(
        ({ position, length, direction }) => new Ship({ position, length, isVertical: direction }),
      ),
    );

    return game;
  }

  attack(gameId: number, playerId: number, position?: Position) {
    const game = this._games.get(gameId);

    if (!game) {
      throw new GameNotFoundError(gameId);
    }

    const results = game.attack(playerId, position);

    if (game.status === 'finished') {
      this._handleFinishedGame(game);
    }

    return { game, results };
  }

  logout(playerId: number) {
    const room = this.db.findRoomByPlayerId(playerId);

    if (room) {
      this.db.deleteRoom(room.id);
    }

    const closedGames: Game[] = [];

    for (const game of this._games.values()) {
      if (game.players.includes(playerId)) {
        game.surrender(playerId);
        this._handleFinishedGame(game);
        closedGames.push(game);
      }
    }

    return { rooms: [room], closedGames };
  }

  singlePlayer(playerId: number): Game {
    const player = this.db.findPlayerById(playerId);

    if (!player) {
      throw new PlayerNotFoundError(playerId);
    }

    const game = new Game({ randomId: ++this._gameCounter, players: [BOT_ID, playerId] });

    this._games.set(game.id, game);
    game.placeRandomShips(BOT_ID);
    return game;
  }

  getWinners() {
    return this.db.getPlayers.filter((player) => player.wins > 0).sort((a, b) => b.wins - a.wins);
  }

  getRooms() {
    return this.db.getRooms;
  }

  private _handleFinishedGame(game: Game) {
    if (!game.winner) {
      return false;
    }

    this._games.delete(game.id);

    if (game.winner === BOT_ID) {
      return true;
    }

    this.db.updatePlayerWins(game.winner);
    return true;
  }
}
