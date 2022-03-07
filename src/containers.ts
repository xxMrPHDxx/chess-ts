import Move from "./move";
import Piece, { Alliance, getSymbol } from "./piece";

export class Pieces {
  private _whites: Set<Piece> = new Set();
  private _blacks: Set<Piece> = new Set();
  
  add(piece: Piece, capture: boolean = false){
    const pieces = piece.ally === Alliance.W ? this._whites : this._blacks;
    pieces.add(piece);
    if(capture){
      const ally = piece.ally === Alliance.W ? 'black' : 'white';
      const elem = document.querySelector(`#captures-${ally}`);
      const span = document.createElement('span');
      span.textContent = getSymbol(piece);
      elem.appendChild(span);
    }
  }

  get black() : Generator<Piece> {
    return Pieces.generator(this._blacks);
  }

  get white() : Generator<Piece> {
    return Pieces.generator(this._whites);
  }

  *[Symbol.iterator](){
    yield* this.white;
    yield* this.black;
  }

  private static* generator(pieces: Set<Piece>) : Generator<Piece> {
    for(const piece of pieces) yield piece;
  }
}

export class Moves {
  private _whites: Set<Move> = new Set();
  private _blacks: Set<Move> = new Set();

  add(move: Move){
    const moves = move.piece.ally === Alliance.W ? this._whites : this._blacks;
    moves.add(move);
  }

  get black() : Generator<Move> { return Moves.generator(this._blacks); }
  get white() : Generator<Move> { return Moves.generator(this._whites); }

  *[Symbol.iterator](): Generator<Move> {
    yield* this.white;
    yield* this.black;
  }

  private static* generator(pieces: Set<Move>) : Generator<Move> {
    for(const piece of pieces) yield piece;
  }
}