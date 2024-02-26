import {
  AttackResultData,
  CommandData,
  Player,
  ResponseType,
  Room,
  ShipData,
  WebSocketResponseWithParsedData,
} from '../types/types';

export class MessageGenerator {
  private static _createMessage = (
    type: ResponseType,
    data: CommandData,
  ): WebSocketResponseWithParsedData => ({
    type,
    data,
    id: 0,
  });

  static regMessage = (player: Partial<Player> | null, errorMessage?: string) =>
    this._createMessage(ResponseType.REG, {
      index: player?.id ?? -1,
      name: player?.name ?? '',
      error: Boolean(errorMessage),
      errorText: errorMessage ?? '',
    });

  static createGameMessage = (gameId: number, playerId: number) =>
    this._createMessage(ResponseType.CREATE_GAME, { idGame: gameId, idPlayer: playerId });

  static updateRoomMessage = (rooms: Room[]) =>
    this._createMessage(
      ResponseType.UPDATE_ROOM,
      rooms.map(({ id, playerId, playerName }) => ({
        roomId: id,
        roomUsers: [{ index: playerId, name: playerName }],
      })),
    );

  static startGameMessage = (playerId: number, ships: ShipData[]) =>
    this._createMessage(ResponseType.START_GAME, {
      ships,
      currentPlayerIndex: playerId,
    });

  static turnMessage = (currentPlayerId: number) =>
    this._createMessage(ResponseType.TURN, { currentPlayer: currentPlayerId });

  static attackResultMessages = (results: AttackResultData[]) =>
    results.map((result) => this._createMessage(ResponseType.ATTACK, result));

  static finishMessage = (winner: number) =>
    this._createMessage(ResponseType.FINISH, { winPlayer: winner });

  static updateWinnersMessage = (players: Player[]) =>
    this._createMessage(
      ResponseType.UPDATE_WINNERS,
      players.map(({ name, wins }) => ({ name, wins })),
    );
}
