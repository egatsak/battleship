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

  getValue(position: Position): DotValue | void {
    if (this.isDotInsideField(position)) {
      return this._dots[position.y][position.x];
    }
  }

  setValue(position: Position, value: DotValue): void {
    if (this.isDotInsideField(position)) {
      this._dots[position.y][position.x] = value;
    }
  }

  setValues(positions: Position[], value: DotValue): void {
    positions.forEach((position) => this.setValue(position, value));
  }

  private _createEmptyField(): DotValue[][] {
    const emptyField: null[][] = new Array(this._size)
      .fill(0)
      .map(() => Array(this._size).fill(null));

    return emptyField;
  }

  private _isCoordinateInside(coord: number): boolean {
    return coord >= 0 && coord < this._size;
  }

  isDotInsideField(position: Position): boolean {
    return this._isCoordinateInside(position.x) && this._isCoordinateInside(position.y);
  }

  isDotEmpty(position: Position): boolean {
    return this.getValue(position) === null;
  }

  areDotsEmpty(positions: Position[]): boolean {
    return positions.every((pos) => this.isDotEmpty(pos));
  }

  getEmptyPositions(): Position[] {
    const result: (Position | undefined)[] = this._dots.flatMap((row, j) =>
      row.map((dot, i) => (dot === null ? { x: i, y: j } : undefined)),
    );

    return result.filter(Boolean) as Position[]; // known TS issue (fixed by Total Typescript)
  }

  getRandomEmptyPosition(): Position | null {
    const positions = this.getEmptyPositions();
    const randomInd = randomInt(positions.length);
    return positions[randomInd] ?? null;
  }
}
