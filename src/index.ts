import Board, { BoardSerializer } from "./board";
import { MouseInput } from "./input";
import { Alliance } from "./piece";
import { createThemeSelector, ThemeSpec } from "./theme";

const canvas: HTMLCanvasElement = document.querySelector('canvas#board');
const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

const TILESIZE = 48;

canvas.width = canvas.height = TILESIZE << 3;

let board: Board = Board.createStandardBoard();
const input = new MouseInput(canvas, TILESIZE);
let theme: ThemeSpec;

async function setup(){
  const themeSelector = await createThemeSelector(
    '#Theme', 
    TILESIZE,
    './themes.json'
  );
  themeSelector.onthemechanged = (selectedTheme: ThemeSpec) => {
    theme = selectedTheme;
    board.draw(ctx, theme.dark, theme.light, TILESIZE);
  }

  const worker: Worker = new Worker('./aiworker.js');
  worker.onmessage = event => {
    const message = event.data;
    switch(message.type){
      case 'move': {
        for(const move of board.moves){
          if(move.piece.pos !== message.from || move.target.pos !== message.to) continue;
          board = move.execute(board);
          board.draw(ctx, theme.dark, theme.light, TILESIZE);
          break;
        }
        worker.postMessage({
          type: 'think',
          player: board.player.ally === Alliance.W ? 'white' : 'black',
          board: BoardSerializer.bit(board),
        });
      } break;
    }
  }
  worker.postMessage({
    type: 'think',
    player: board.player.ally === Alliance.W ? 'white' : 'black',
    board: BoardSerializer.bit(board),
  });

  // input.onfirstclick = pos => {
  //   const tile = board.getTile(pos);
  //   if(tile.piece === null || tile.piece.ally !== board.player.ally) return false;
  //   input.hints.addLegalMovesHint(board, tile);
  //   return true;
  // }
  // input.onsecondclick = (src, dest) => {
  //   for(const move of board.player.moves){
  //     if(move.piece.pos === src && move.target.pos === dest){
  //       board = board.makeMove(move);
  //       break;
  //     }
  //   }
  // }
  // input.onclick = () => {
  //   input.hints.addChecksHint(board);
  //   board.draw(ctx, theme.dark, theme.light, TILESIZE);
  // }
}

setup();