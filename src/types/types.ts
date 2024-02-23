export interface WebSocketCommand {
  type: CommandType;
  data: string;
  id: 0;
}

export interface WebSocketCommandWithParsedData {
  type: CommandType;
  data: CommandData;
  id: 0;
}

export enum CommandType {
  REG = 'reg',
  UPDATE_WINNERS = 'update_winners',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
  FINISH = 'finish',
}

export interface Player {
  id: number;
  name: string;
  password: string;
  wins: number;
}

export interface Room {
  id: number;
  playerId: number;
  playerName: string;
}

export type CommandData =
  | RegData
  | RegResultData
  | UpdateWinnersData
  | AddUserToRoomData
  | CreateGameData
  | AddShipsData
  | StartGameData
  | AttackData
  | AttackResultData
  | RandomAttackData
  | TurnData
  | FinishData;

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface Position {
  x: number;
  y: number;
}

export type DotValue = boolean | null;

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export type AttackStatus = 'miss' | 'killed' | 'shot';

export interface RegData {
  name: string;
  password: string;
}

export interface RegResultData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export type UpdateWinnersData = Array<{ name: string; wins: number }>;

export type CreateRoomData = '';

export interface AddUserToRoomData {
  indexRoom: number;
}

export interface CreateGameData {
  idGame: number;
  idPlayer: number;
}

export type UpdateRoomData = Array<{
  roomId: number;
  roomUsers: Array<{ name: string; index: number }>;
}>;

export interface AddShipsData {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}

export interface StartGameData {
  ships: Ship[];
  currentPlayerIndex: number;
}

export interface AttackData {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

export interface AttackResultData {
  position: Position;
  currentPlayer: number;
  status: AttackStatus;
}

export interface RandomAttackData {
  gameId: number;
  indexPlayer: number;
}

export interface TurnData {
  currentPlayer: number;
}

export interface FinishData {
  winPlayer: number;
}
