import Board, { Builder, Tile } from "./board";
import Piece, { King, Pawn } from "./piece";

export default abstract class Move {
  protected _attack: boolean;
  protected _piece: Piece;
  protected _target: Tile;

  constructor(piece: Piece, target: Tile){
    this._attack = target.piece !== null;
    this._piece = piece;
    this._target = target;
  }

  get attack() : boolean { return this._attack; }
  get piece() : Piece { return this._piece; }
  get target() : Tile { return this._target; }

  abstract execute(board: Board) : Board;
}

export class Normal extends Move {
  execute(board: Board): Board {
    const builder = new Builder(board.opponent.ally);
    for(const piece of board.pieces){
      if(this.piece === piece || this.target.piece === piece) continue;
      builder.setPiece(piece);
    }
    return builder
      .setPiece(this.piece.moveTo(this.target.pos))
      .build();
  }
}

export class PawnJump extends Move {
  execute(board: Board): Board {
    const builder = new Builder(board.opponent.ally);
    for(const piece of board.pieces){
      if(this.piece === piece) continue;
      builder.setPiece(piece);
    }
    const pawn = this.piece.moveTo(this.target.pos);
    return builder
      .setPiece(pawn)
      .setEnPassantPawn(pawn)
      .build();
  }
}

export class Castling extends Move {
  private king: King;
  constructor(piece: Piece, king: King, target: Tile){
    super(piece, target);
    this.king = king;
    this._attack = false;
  }
  execute(board: Board): Board {
    const builder = new Builder(board.opponent.ally);
    for(const piece of board.pieces){
      if(this.piece === piece || this.target.piece === piece) continue;
      builder.setPiece(piece);
    }
    const off = this.piece.pos > this.target.piece.pos ? 1 : -1;
    return builder
      .setPiece(this.piece.moveTo(this.target.pos))
      .setPiece(this.king.moveTo(this.target.pos + off))
      .build();
  }
}

export class EnPassantCapture extends Move {
  private _captured: Pawn;
  constructor(piece: Piece, target: Tile, captured: Pawn){
    super(piece, target)
    this._attack = true;
    this._captured = captured;
  }
  execute(board: Board): Board {
    const builder = new Builder(board.opponent.ally);
    for(const piece of board.pieces){
      if(this.piece === piece || this._captured === piece) continue;
      builder.setPiece(piece);
    }
    return builder
      .setPiece(this.piece.moveTo(this.target.pos))
      .build();
  }
  get captured(): Pawn { return this._captured; }
}

export class Promotion<T extends Piece> extends Move {
  private _move: Move;
  private _promoteTo: T;
  constructor(move: Move, promoteTo: T){
    super(move.piece, move.target);
    this._move = move;
    this._promoteTo = promoteTo;
  }
  execute(board: Board): Board {
    const _board = this._move.execute(board);
    const builder = new Builder(_board.player.ally);
    for(const piece of _board.pieces){
      if(piece.pos === this.target.pos)
        builder.setPiece(this._promoteTo);
      else
        builder.setPiece(piece);
    }
    return builder
      .build();
  }
}