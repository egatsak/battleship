import { Ship } from '../models/Ship';
import {
  AddShipsData,
  AddUserToRoomData,
  AttackData,
  CommandData,
  CommandHandler,
  CommandType,
  Position,
  RegData,
  ShipData,
  ShipType,
  WebSocketCommandWithParsedData,
  WebSocketContext,
} from '../types/types';
import { GameService } from '../services/game.service';
import { MessageGenerator } from '../helpers/messages';
import { BOT_ID, BOT_TIMEOUT } from '../constants/constants';

export class BattleShipController {
  private readonly _gameService: GameService;
  private _commandMapper: Record<CommandType, CommandHandler>;

  constructor() {
    this._gameService = new GameService();

    this._commandMapper = {
      [CommandType.REG]: this.reg,
      [CommandType.CREATE_ROOM]: this.createRoom,
      [CommandType.ADD_USER_TO_ROOM]: this.addUserToRoom,
      [CommandType.ADD_SHIPS]: this.addShips,
      [CommandType.ATTACK]: this.attack,
      [CommandType.RANDOM_ATTACK]: this.randomAttack,
      [CommandType.SINGLE_PLAY]: this.singlePlay,
    } satisfies Record<CommandType, CommandHandler>;
  }

  handleIncoming(message: WebSocketCommandWithParsedData, context: WebSocketContext) {
    const handler = this._commandMapper[message.type].bind(this);
    handler(message.data, context);
  }

  handleClose = (context: WebSocketContext) => {
    const { rooms, closedGames } = this._gameService.logout(context.id);

    if (rooms.length) {
      const allRooms = this._gameService.getRooms();
      context.broadcast([MessageGenerator.updateRoomMessage(allRooms)]);
    }

    closedGames.forEach((game) => {
      if (game.winner) {
        context.broadcast([MessageGenerator.finishMessage(game.winner)], game.players);
      }
    });

    if (closedGames.length) {
      const winners = this._gameService.getWinners();
      context.broadcast([MessageGenerator.updateWinnersMessage(winners)]);
    }
  };

  reg(data: CommandData, context: WebSocketContext) {
    const loginPayload = data as RegData;

    try {
      const player = this._gameService.login(loginPayload, context.id);
      context.send([MessageGenerator.regMessage(player)]);

      const winners = this._gameService.getWinners();
      context.send([MessageGenerator.updateWinnersMessage(winners)]);

      const rooms = this._gameService.getRooms();
      context.send([MessageGenerator.updateRoomMessage(rooms)]);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Smth went wrong';
      context.send([
        MessageGenerator.regMessage({ id: context.id, name: loginPayload.name }, message),
      ]);
    }
  }

  createRoom(_data: CommandData, context: WebSocketContext) {
    this._gameService.createRoom(context.id);

    const rooms = this._gameService.getRooms();
    context.broadcast([MessageGenerator.updateRoomMessage(rooms)]);
  }

  addUserToRoom(data: CommandData, context: WebSocketContext) {
    const { indexRoom } = data as AddUserToRoomData;

    const game = this._gameService.joinRoom(context.id, indexRoom);

    if (game) {
      // TODO

      game.players.forEach((playerId) =>
        context.broadcast([MessageGenerator.createGameMessage(game.id, playerId)], [playerId]),
      );

      const rooms = this._gameService.getRooms();
      context.broadcast([MessageGenerator.updateRoomMessage(rooms)]);
    }
  }

  addShips(data: CommandData, context: WebSocketContext) {
    const { gameId, ships, indexPlayer } = data as AddShipsData;

    const game = this._gameService.addShips(gameId, indexPlayer, ships);

    if (game.status === 'started') {
      const { currentPlayer, currentShips, enemyPlayer, enemyShips } = game;

      [
        { player: currentPlayer, ships: currentShips },
        { player: enemyPlayer, ships: enemyShips },
      ].map(({ player, ships }) =>
        context.broadcast(
          [
            MessageGenerator.startGameMessage(
              player,
              ships.map((ship) => this._getShipData(ship)),
            ),
          ],
          [player],
        ),
      );

      context.broadcast(
        [MessageGenerator.turnMessage(currentPlayer)],
        [currentPlayer, enemyPlayer],
      );

      if (game.currentPlayer === BOT_ID) {
        this._botAttack(gameId, context);
      }
    }
  }

  attack(data: CommandData, context: WebSocketContext) {
    const { gameId, x, y, indexPlayer } = data as AttackData;

    let position: Position | undefined;

    if (x !== undefined && y !== undefined) {
      position = { x, y };
    }

    const { game, results } = this._gameService.attack(gameId, indexPlayer, position);

    context.broadcast(MessageGenerator.attackResultMessages(results), game.players);
    context.broadcast([MessageGenerator.turnMessage(game.currentPlayer)], game.players);

    if (game.status === 'started' && game.currentPlayer === BOT_ID) {
      this._botAttack(gameId, context);
    }

    if (game.winner) {
      context.broadcast([MessageGenerator.finishMessage(game.winner)], game.players);

      if (game.winner !== BOT_ID) {
        const winners = this._gameService.getWinners();
        context.broadcast([MessageGenerator.updateWinnersMessage(winners)]);
      }
    }
  }

  randomAttack(data: CommandData, context: WebSocketContext) {
    this.attack(data, context);
  }

  singlePlay(_data: CommandData, context: WebSocketContext) {
    const game = this._gameService.singlePlayer(context.id);
    context.send([MessageGenerator.createGameMessage(game.id, context.id)]);

    const rooms = this._gameService.getRooms();
    context.broadcast([MessageGenerator.updateRoomMessage(rooms)]);
  }

  private _getShipData({ position, length, isVertical }: Ship): ShipData {
    const type = this._getShipType(length);
    return {
      position,
      length,
      direction: isVertical,
      type,
    };
  }

  private _getShipType(length: number) {
    const types = ['small', 'medium', 'large', 'huge'] as ShipType[];

    return types[length - 1] ?? 'small';
  }

  private _botAttack(gameId: number, context: WebSocketContext) {
    setTimeout(() => this.randomAttack({ gameId, indexPlayer: BOT_ID }, context), BOT_TIMEOUT);
  }
}
