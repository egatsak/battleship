import { WebSocketCommandWithParsedData, WebSocketResponseWithParsedData } from '../types/types';

export function customStringify(
  wsCommand: WebSocketCommandWithParsedData | WebSocketResponseWithParsedData,
) {
  return JSON.stringify({ ...wsCommand, data: JSON.stringify(wsCommand.data) });
}
