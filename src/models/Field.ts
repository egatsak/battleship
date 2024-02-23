import { randomInt } from 'crypto';
import { DotValue, Position } from '../types/types';

export class Field {
  private _dots: DotValue[][];

  constructor(private readonly _size = 10) {
    this._dots = this._createEmptyField();
  }

  get size() {
    return this._size;
  }

  get dots() {
    return this._dots;
  }

  isDotEmpty(position: Position) {
    return this.getValue(position) === null;
  }

  areDotsEmpty(positions: Position[]) {
    return positions.every((pos) => this.isDotEmpty(pos));
  }

  getValue(position: Position) {
    if (this.isDotInsideField(position)) {
      return this._dots[position.y][position.x];
    }
  }

  setValue(position: Position, value: DotValue) {
    if (this.isDotInsideField(position)) {
      this._dots[position.y][position.x] = value;
    }
  }

  setValues(positions: Position[], value: DotValue) {
    positions.forEach((position) => this.setValue(position, value));
  }

  private _createEmptyField() {
    const emptyField: null[][] = new Array(this._size)
      .fill(null)
      .map(() => Array(this._size).fill(null));
    return emptyField;
  }

  private _isCoordinateInside(coord: number) {
    return coord >= 0 && coord < this._size;
  }

  isDotInsideField(position: Position) {
    return (
      this._isCoordinateInside(position.x) &&
      this._isCoordinateInside(position.y)
    );
  }

  getEmptyPositions(): Position[] {
    const result: (Position | undefined)[] = this._dots.flatMap((row, j) =>
      row.map((dot, i) => (dot === null ? { x: i, y: j } : undefined)),
    );

    return result.filter(Boolean) as Position[]; // known TS issue (fixed by Total Typescript)
  }

  getRandomEmptyPosition() {
    const positions = this.getEmptyPositions();
    const randomInd = randomInt(positions.length);
    return positions[randomInd] ?? null;
  }
}
