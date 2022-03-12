import { Builder } from "../board";
import Algorithm, { AlphaBetaPruning, Minimax } from "./algoritm";
import { Default } from "./evaluator";

// const ai: Algorithm = new Minimax(new Default(), 3);
const ai: Algorithm = new AlphaBetaPruning(new Default(), 3);

let current: string = null;
function handleEvent(type: string, data: any){
  if(type === 'think'){
    console.debug(`${data.player} player is thinking`);
    current = data.player;
    const board = Builder.fromBit(data.board);
    const move = ai.evaluate(board);
    self.postMessage({
      type: 'move',
      from: move.piece.pos,
      to: move.target.pos,
    });
  }
}

self.onmessage = event => {
  const message = event.data;
  handleEvent(message.type, message);
}

self.onmessageerror = err => console.error('Error', err);