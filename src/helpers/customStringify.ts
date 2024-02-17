import { WebSocketCommand } from '../types/types';

export function customStringify(wsCommand: WebSocketCommand) {
  return JSON.stringify({ ...wsCommand, data: JSON.stringify(wsCommand.data) });
}
