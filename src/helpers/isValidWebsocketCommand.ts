import { CommandData, WebSocketCommand } from '../types/types';

export function isValidWebsocketCommand(obj: any): obj is WebSocketCommand {
  return (
    'type' in obj &&
    'data' in obj &&
    'id' in obj &&
    Object.keys(obj).length === 3
  );
}

export function isValidWebSocketCommandData(data: any): data is CommandData {
  // TODO match typing
  return true;
}
