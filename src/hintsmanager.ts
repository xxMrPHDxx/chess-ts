import Board, { Tile } from "./board";

export class MovesHintManager {
  private canvas: HTMLCanvasElement;
  private movesHint: HTMLDivElement[] = [];
  private checksHint: HTMLDivElement[] = [];
  private size: number;
  constructor(canvas: HTMLCanvasElement, size: number){
    this.canvas = canvas;
    this.size = size;
  }
  addChecksHint(board: Board){
    for(const hint of this.checksHint) document.body.removeChild(hint);
    this.checksHint.length = 0;
    for(const player of [board.player, board.opponent]){
      if(!player.check && !player.checkmate && !player.stalemate) continue;
      const cls = player.checkmate ? 'checkmate' : player.stalemate ? 'stalemate' : 'check';
      const div = document.createElement('div');
      div.setAttribute('class', `hint ${cls}`);
      ['width', 'height'].forEach(d => div.setAttribute(d, `${this.size}px`));
      div.style.left = `${this.canvas.offsetLeft + player.king.col*this.size}px`;
      div.style.top = `${this.canvas.offsetTop + player.king.row*this.size}px`;
      div.style.width = div.style.height = `${this.size}px`;
      document.body.append(div);
      this.checksHint.push(div);
    }
  }
  addLegalMovesHint(board: Board, tile: Tile){
    if(tile.piece === null || tile.piece.ally !== board.player.ally) return;
    
    const div = document.createElement('div');
    div.setAttribute('class', 'hint moving-piece');
    ['width', 'height'].forEach(d => div.setAttribute(d, `${this.size}px`));
    div.style.left = `${this.canvas.offsetLeft + tile.piece.col*this.size}px`;
    div.style.top = `${this.canvas.offsetTop + tile.piece.row*this.size}px`;
    div.style.width = div.style.height = `${this.size}px`;
    document.body.append(div);
    this.movesHint.push(div);

    for(const move of board.player.getMovesForPiece(tile.piece)){
      const target = move.target;
      const div = document.createElement('div');
      div.classList.add('hint');
      if(move.attack) div.classList.add('attack');
      ['width', 'height'].forEach(d => div.setAttribute(d, `${this.size}px`));
      div.style.left = `${this.canvas.offsetLeft + target.col*this.size}px`;
      div.style.top = `${this.canvas.offsetTop + target.row*this.size}px`;
      div.style.width = div.style.height = `${this.size}px`;
      document.body.append(div);
      this.movesHint.push(div);
    }
  }
  clear(){
    this.movesHint.forEach(e => document.body.removeChild(e));
    this.movesHint.length = 0;
  }
}