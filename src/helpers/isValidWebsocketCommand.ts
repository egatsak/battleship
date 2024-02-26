import { CommandData, CommandType, WebSocketCommand } from '../types/types';

export function isValidWebsocketCommand(obj: any): obj is WebSocketCommand {
  return 'type' in obj && 'data' in obj && 'id' in obj && Object.keys(obj).length === 3;
}

export function isValidWebSocketCommandData(type: CommandType, data: any): data is CommandData {
  switch (type) {
    case CommandType.REG: {
      return (
        'name' in data &&
        typeof data.name === 'string' &&
        data.name.length >= 5 &&
        'password' in data &&
        typeof data.password === 'string' &&
        data.password.length >= 5 &&
        Object.keys(data).length === 2
      );
    }
    case CommandType.CREATE_ROOM:
      return data === '';
    case CommandType.ADD_USER_TO_ROOM:
      return 'indexRoom' in data && Object.keys(data).length === 1;
    case CommandType.ADD_SHIPS:
      return (
        'gameId' in data &&
        'ships' in data &&
        'indexPlayer' in data &&
        Object.keys(data).length === 3
      );
    case CommandType.ATTACK:
      return (
        'gameId' in data &&
        'x' in data &&
        'y' in data &&
        'indexPlayer' in data &&
        Object.keys(data).length === 4
      );
    case CommandType.RANDOM_ATTACK:
      return 'gameId' in data && 'indexPlayer' in data && Object.keys(data).length === 2;
    case CommandType.SINGLE_PLAY:
      return data === '';
    default:
      return false;
  }
}
