import { WebSocketCommand } from '../types/types';

export function isValidWebsocketCommand(obj: any): obj is WebSocketCommand {
  return (
    'type' in obj &&
    'data' in obj &&
    'id' in obj &&
    Object.keys(obj).length === 3
  );
}
