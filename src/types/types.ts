export interface WebSocketCommand {
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

export interface CommandData {
  name?: string;
  index?: number;
  error?: boolean;
  errorText?: string;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export type AttackStatus = 'miss' | 'killed' | 'shot';
