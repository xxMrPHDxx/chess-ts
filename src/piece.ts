import Board from "./board";
import Move, { Castling, EnPassantCapture, Normal, PawnJump, Promotion } from "./move";

export enum Alliance { W, B };
export enum Type { 
  R='\u265c', 
  N='\u265e', 
  B='\u265d', 
  Q='\u265b', 
  K='\u265a', 
  P='\u265f', 
};

export default abstract class Piece {
  private _type: Type;
  private _pos: number;
  private _ally: Alliance;
  private _moved: boolean;

  constructor(type: Type, pos: number, ally: Alliance, moved: boolean = false){
    this._type = type;
    this._pos = pos;
    this._ally = ally;
    this._moved = moved;
  }

  get ally() : Alliance { return this._ally; }
  get col() : number { return this._pos & 7; }
  get moved() : boolean { return this._moved; }
  get pos() : number { return this._pos; }
  get row() : number { return this._pos >> 3; }
  get type() : Type { return this._type; }

  abstract calculateLegalMoves(board: Board) : Generator<Move>;
  abstract moveTo(dest: number): Piece;
};

export class Rook extends Piece {
  constructor(pos: number, ally: Alliance, moved: boolean = false){
    super(Type.R, pos, ally, moved);
  }
  *calculateLegalMoves(board: Board): Generator<Move> {
    for(const off of [-8,-1,1,8]){
      let dest = this.pos;
      while(Board.isValidPosition(dest + off)){
        if(((dest & 7) === 0 && off === -1) || 
          ((dest & 7) === 7 && off === 1)) break;
        dest += off;
        const tile = board.getTile(dest);
        const move: Move = new Normal(this, tile);
        if(tile.piece === null || tile.piece.ally !== this.ally) yield move;
        if(tile.piece !== null){
          if(this.ally === tile.piece.ally && tile.piece.type === Type.K){
            if(!this.moved && !tile.piece.moved)
              yield new Castling(this, board.getTile(dest).piece, tile);
          }
          break;
        }
      }
    }
  }
  moveTo(dest: number): Rook {
    return new Rook(dest, this.ally, true);
  }
}

export class Knight extends Piece {
  constructor(pos: number, ally: Alliance, moved: boolean = false){
    super(Type.N, pos, ally, moved);
  }
  *calculateLegalMoves(board: Board): Generator<Move> {
    for(const off of [-17,-15,-10,-6,6,10,15,17]){
      const dest = this.pos + off;
      if(!Board.isValidPosition(dest) || 
        ((this.pos & 7) === 0 && [-17,-10,6,15].includes(off)) || 
        ((this.pos & 7) === 1 && [-10,6].includes(off)) ||
        ((this.pos & 7) === 6 && [-6,10].includes(off)) || 
        ((this.pos & 7) === 7 && [-15,-6,10,17].includes(off))) continue;
      const tile = board.getTile(dest);
      if(tile.piece && tile.piece.ally === this.ally) continue;
      yield new Normal(this, tile);
    }
  }
  moveTo(dest: number): Knight {
    return new Knight(dest, this.ally, true);
  }
}

export class Bishop extends Piece {
  constructor(pos: number, ally: Alliance, moved: boolean = false){
    super(Type.B, pos, ally, moved);
  }
  *calculateLegalMoves(board: Board): Generator<Move> {
    for(const off of [-9,-7,7,9]){
      let dest = this.pos;
      while(Board.isValidPosition(dest + off)){
        if(((dest & 7) === 0 && [-9,7].includes(off)) || 
          ((dest & 7) === 7 && [-7,9].includes(off))) break;
        dest += off;
        const tile = board.getTile(dest);
        const move: Move = new Normal(this, tile);
        if(tile.piece === null || tile.piece.ally !== this.ally) yield move;
        if(tile.piece !== null) break;
      }
    }
  }
  moveTo(dest: number): Bishop {
    return new Bishop(dest, this.ally, true);
  }
}

export class Queen extends Piece {
  constructor(pos: number, ally: Alliance, moved: boolean = false){
    super(Type.Q, pos, ally, moved);
  }
  *calculateLegalMoves(board: Board): Generator<Move> {
    for(const off of [-9,-8,-7,-1,1,7,8,9]){
      let dest = this.pos;
      while(Board.isValidPosition(dest + off)){
        if(((dest & 7) === 0 && [-9,-1,7].includes(off)) || 
          ((dest & 7) === 7 && [-7,1,9].includes(off))) break;
        dest += off;
        const tile = board.getTile(dest);
        const move: Move = new Normal(this, tile);
        if(tile.piece === null || tile.piece.ally !== this.ally) yield move;
        if(tile.piece !== null) break;
      }
    }
  }
  moveTo(dest: number): Queen {
    return new Queen(dest, this.ally, true);
  }
}

export class King extends Piece {
  constructor(pos: number, ally: Alliance, moved: boolean = false){
    super(Type.K, pos, ally, moved);
  }
  *calculateLegalMoves(board: Board): Generator<Move> {
    for(const off of [-9,-8,-7,-1,1,7,8,9]){
      let dest = this.pos;
      if(!Board.isValidPosition(dest + off) || 
        ((this.pos & 7) === 0 && [-9,-1,7].includes(off)) || 
        ((this.pos & 7) === 7 && [-7,1,9].includes(off))) continue;
      dest += off;
      const tile = board.getTile(dest);
      if(tile.piece !== null && tile.piece.ally === this.ally) continue;
      yield new Normal(this, tile);
    }
  }
  moveTo(dest: number): King {
    return new King(dest, this.ally, true);
  }
}

export class Pawn extends Piece {
  constructor(pos: number, ally: Alliance, moved: boolean = false){
    super(Type.P, pos, ally, moved);
  }
  *calculateLegalMoves(board: Board): Generator<Move> {
    const dir = this.ally === Alliance.W ? -1 : 1;
    for(const off of [7,8,9,16]){
      const dest = this.pos + off * dir;
      if(!Board.isValidPosition(dest) || 
        ((this.pos & 7) === 0 && [-9,7].includes(off * dir)) || 
        ((this.pos & 7) === 7 && [-7,9].includes(off * dir))) continue;
      const tile = board.getTile(dest);
      const move = new Normal(this, tile);
      switch(off){
        case 7: case 9: {
          if(tile.piece !== null && tile.piece.ally !== this.ally){
            if([0,7].includes(dest >> 3)){
              yield new Promotion<Queen>(move, new Queen(dest, this.ally, true)); 
            }
            else yield move;
          }
          else if(board.enpassant !== null && 
            board.enpassant.ally !== this.ally &&
            Math.abs(board.enpassant.pos - dest) === 8 &&
            Math.abs(board.enpassant.pos - this.pos) === 1){
            yield new EnPassantCapture(this, tile, board.enpassant);
          }
        } break;
        case 16: {
          const behind = board.getTile(dest - dir * 8);
          if(this.moved || tile.piece || behind.piece) continue;
          yield new PawnJump(this, tile);
        } break;
        case 8: {
          if(tile.piece === null){
            if([0,7].includes(dest >> 3)){
              yield new Promotion<Queen>(move, new Queen(dest, this.ally, true)); 
            }
            else yield move;
          }
        }
      }
    }
  }
  moveTo(dest: number): Pawn {
    return new Pawn(dest, this.ally, true);
  }
}

export function getSymbol(piece: Piece) : string {
  if(!piece) return '';
  switch(piece.ally){
    case Alliance.B: switch(piece.type){
      case Type.R: return '\u265c'; 
      case Type.N: return '\u265e'; 
      case Type.B: return '\u265d'; 
      case Type.Q: return '\u265b'; 
      case Type.K: return '\u265a'; 
      case Type.P: return '\u265f'; 
    }
    case Alliance.W: switch(piece.type){
      case Type.R: return '\u2656'; 
      case Type.N: return '\u2658'; 
      case Type.B: return '\u2657'; 
      case Type.Q: return '\u2655'; 
      case Type.K: return '\u2654'; 
      case Type.P: return '\u2659'; 
    }
  }
}