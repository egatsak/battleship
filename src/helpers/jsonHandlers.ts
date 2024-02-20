import { WebSocketCommandWithParsedData } from '../types/types';

export function customStringify(wsCommand: WebSocketCommandWithParsedData) {
  return JSON.stringify({ ...wsCommand, data: JSON.stringify(wsCommand.data) });
}
