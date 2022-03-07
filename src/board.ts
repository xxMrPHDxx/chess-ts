import { Moves, Pieces } from "./containers";
import Move, { EnPassantCapture } from "./move";
import Piece, { Alliance, Bishop, getSymbol, King, Knight, Pawn, Queen, Rook } from "./piece";
import Player, { NoKingFound } from "./player";

export class Tile {
  private _pos: number;
  private _row: number;
  private _col: number;
  public piece: Piece | null = null;
  constructor(pos: number, piece: Piece | null = null){
    this._pos = pos;
    this._row = pos >> 3;
    this._col = pos & 7;
    this.piece = piece;
  }
  get col(){ return this._col }
  get pos(){ return this._pos }
  get row(){ return this._row }
};

export default class Board {
  private moveMaker: Alliance;
  private tiles: Array<Tile> = new Array();
  private activePieces: Pieces = new Pieces();
  private capturedPieces: Pieces = new Pieces();
  private legalMoves: Moves = new Moves();

  private whitePlayer: Player;
  private blackPlayer: Player;
  private currentPlayer: Player;

  private enPassant: Pawn;
  
  constructor(builder: Builder){
    this.moveMaker = builder.moveMaker;
    this.enPassant = builder.enPassantPawn;
    for(let i=0; i<64; i++){
      const tile = builder.tiles.get(i);
      if(tile.piece !== null) this.pieces.add(tile.piece);
      this.tiles.push(tile);
    }
    for(const piece of this.pieces){
      for(const move of piece.calculateLegalMoves(this)){
        this.legalMoves.add(move);
      }
    }

    this.whitePlayer = new Player(this, Alliance.W, this.activePieces, this.legalMoves);
    this.blackPlayer = new Player(this, Alliance.B, this.activePieces, this.legalMoves);
    this.currentPlayer = this.moveMaker === Alliance.W ? this.whitePlayer : this.blackPlayer;
  }

  draw(ctx: CanvasRenderingContext2D, darkColor: string, lightColor: string, size: number){
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size * 0.9}px Arial`;
    for(let i=0; i<64; i++){
      const row = i >> 3, col = i & 7, tile = this.tiles[i];
      ctx.fillStyle = (row + col) % 2 !== 0 ? darkColor : lightColor;
      ctx.fillRect(col*size, row*size, size, size);
      if(tile.piece){
        const symbol = getSymbol(tile.piece);
        ctx.fillStyle = 'black';
        ctx.fillText(symbol, (tile.piece.col+0.5)*size, (tile.piece.row+0.5)*size);
      }
    }
  }

  getTile(pos: number){
    if(pos < 0 || pos >= 64) throw new Error('Tile index out of bounds!');
    return this.tiles[pos];
  }

  isCurrentPlayer(ally: Alliance){
    return ally === this.moveMaker;
  }

  makeMove(move: Move) : Board {
    if(move.piece === null || move.piece.ally !== this.moveMaker) return this;
    try{
      const board = move.execute(this);
      if(board.opponent.check) return this;
      if(move.attack){
        if(move instanceof EnPassantCapture) this.capturedPieces.add(move.captured, true);
        else this.capturedPieces.add(move.target.piece, true);
      }
      return board;
    }catch(err){
      if(err instanceof NoKingFound) return this;
      else throw err;
    }
  }
  
  setPiece(piece: Piece){
    if(piece.pos < 0 || piece.pos >= 64) return;
    this.tiles[piece.pos].piece = piece;
  }

  get captures() : Pieces { return this.capturedPieces; }
  get moves() : Moves { return this.legalMoves; }
  get pieces() : Pieces { return this.activePieces; }

  get white(): Player { return this.whitePlayer; }
  get black(): Player { return this.blackPlayer; }
  get player(): Player { return this.currentPlayer; }
  get opponent(): Player { 
    if(this.currentPlayer === this.whitePlayer) return this.blackPlayer; 
    return this.whitePlayer;
  }

  get enpassant(): Pawn { return this.enPassant; }

  static createStandardBoard() : Board {
    return [
      -1,-2,-3,-4,-5,-3,-2,-1,
      -6,-6,-6,-6,-6,-6,-6,-6,
      ...new Array(4*8).fill(0),
        6, 6, 6, 6, 6, 6, 6, 6,
        1, 2, 3, 4, 5, 3, 2, 1,
    ].reduce((builder, p, pos) => {
      const ally = p < 0 ? Alliance.B : Alliance.W;
      switch(Math.abs(p)){
        case 1: builder.setPiece(new Rook(pos, ally)); break;
        case 2: builder.setPiece(new Knight(pos, ally)); break;
        case 3: builder.setPiece(new Bishop(pos, ally)); break;
        case 4: builder.setPiece(new Queen(pos, ally)); break;
        case 5: builder.setPiece(new King(pos, ally)); break;
        case 6: builder.setPiece(new Pawn(pos, ally)); break;
      }
      return builder;
    }, new Builder()).build();
  }
  static isValidPosition(pos: number) : boolean {
    return pos >= 0 && pos < 64;
  }
  static getOpponent(ally: Alliance) : Alliance {
    return ally === Alliance.W ? Alliance.B : Alliance.W;
  }
}

export class Builder {
  public moveMaker: Alliance;
  public enPassantPawn: Pawn = null;
  private _tiles: Map<number, Tile> = new Map();
  constructor(moveMaker: Alliance = Alliance.W){
    this.moveMaker = moveMaker;
    for(let i=0; i<64; i++) this._tiles.set(i, new Tile(i));
  }
  get tiles() : Map<number, Tile> { return this._tiles; }
  setEnPassantPawn(pawn: Pawn){
    this.enPassantPawn = pawn;
    return this;
  }
  setPiece(piece: Piece): Builder {
    const tile = this._tiles.get(piece.pos);
    if(!tile) return this;
    tile.piece = piece;
    return this;
  }
  build() : Board {
    return new Board(this);
  }
}