import Board from "./board";
import { Moves, Pieces } from "./containers";
import Move from "./move";
import Piece, { Alliance, King } from "./piece";

export class NoKingFound extends Error {
  constructor(ally: Alliance){
    super(`No king found for ${ally === Alliance.W ? 'white' : 'black'} player`)
  }
}

export default class Player {
  private board: Board;
  private _ally: Alliance;
  private _pieces: Set<Piece> = new Set();
  private _moves: Set<Move> = new Set();
  private _king: King = null;
  private _inCheck: boolean;
  
  constructor(board: Board, ally: Alliance, pieces: Pieces, moves: Moves){
    this.board = board;
    this._ally = ally;
    for(const piece of ally === Alliance.W ? pieces.white : pieces.black){
      this._pieces.add(piece);
      if(piece instanceof King && !this._king) this._king = piece;
    }
    for(const move of ally === Alliance.W ? moves.white : moves.black){
      this._moves.add(move);
    }
    if(this._king === null) throw new NoKingFound(ally);
    this._inCheck = Player.hasAttackOnTile(
      ally === Alliance.W ? moves.black : moves.white,
      this._king.pos
    );
  }

  *getMovesForPiece(piece: Piece): Generator<Move> {
    if(!this._pieces.has(piece)) return;
    for(const move of this._moves){
      if(move.piece === piece) yield move;
    }
  }

  get ally(): Alliance { return this._ally; }
  get king(): King { return this._king; }
  get moves(): Set<Move> { return this._moves; }
  get pieces(): Set<Piece> { return this._pieces; }
  
  get check(): boolean { return this._inCheck; }
  get checkmate(): boolean { 
    return this._inCheck && !this.hasEscapeMoves(); 
  }
  get stalemate(): boolean { 
    return !this._inCheck && !this.hasEscapeMoves(); 
  }

  private hasEscapeMoves(): boolean {
    for(const move of this._moves){
      try{
        const board = move.execute(this.board);
        if(!board.opponent.check) return true;
      }catch(err){
        continue;
      }
    }
    return false;
  }

  private static hasAttackOnTile(moves: Generator<Move>, pos: number): boolean {
    for(const move of moves){
      if(move.target.pos === pos) return true;
    }
    return false;
  }
}