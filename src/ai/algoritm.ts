import Board from "../board";
import Move from "../move";
import { Alliance } from "../piece";
import BoardEvaluator from "./evaluator";

export default abstract class Algorithm {
  protected evaluator: BoardEvaluator;
  constructor(evaluator: BoardEvaluator){
    this.evaluator = evaluator;
  }
  abstract evaluate(board: Board): Move;
}

export class Minimax extends Algorithm {
  private depth: number;
  constructor(evaluator: BoardEvaluator, depth: number=3){
    super(evaluator);
    this.depth = depth;
  }
  evaluate(board: Board): Move {
    const isWhite = board.player.ally === Alliance.W;
    let value = isWhite ? -Infinity : Infinity, bestMove = null;
    for(const move of board.player.moves){
      try{
        const next = board.makeMove(move);
        if(board === next) continue;
        if(isWhite){
          const val = this.max(next, this.depth-1);
          if(val > value){
            value = val;
            bestMove = move;
          }
        }else{
          const val = this.min(next, this.depth-1);
          if(val < value){
            value = val;
            bestMove = move;
          }
        }
      }catch(err){ continue; }
    }
    return bestMove;
  }
  private min(board: Board, depth: number): number {
    if(Board.gameEnded(board) || depth <= 0) 
      return this.evaluator.evaluate(board, depth);
    let minValue = Infinity;
    for(const move of board.player.moves){
      try{
        const next = move.execute(board);
        const value = this.max(next, depth-1);
        if(value < minValue) minValue = value;
      }catch(err){ continue; }
    }
    return minValue;
  }
  private max(board: Board, depth: number): number {
    if(Board.gameEnded(board) || depth <= 0) 
      return this.evaluator.evaluate(board, depth);
    let maxValue = -Infinity;
    for(const move of board.player.moves){
      try{
        const next = move.execute(board);
        const value = this.min(next, depth-1);
        if(value > maxValue) maxValue = value;
      }catch(err){ continue; }
    }
    return maxValue;
  }
}

export class AlphaBetaPruning extends Algorithm {
  private depth: number;
  constructor(evaluator: BoardEvaluator, depth: number=3){
    super(evaluator);
    this.depth = depth;
  }
  evaluate(board: Board): Move {
    const isWhite = board.player.ally === Alliance.W;
    let value = isWhite ? -Infinity : Infinity, bestMove = null;
    for(const move of board.player.moves){
      try{
        const next = board.makeMove(move);
        if(board === next) continue;
        if(isWhite){
          const val = this.max(next, this.depth-1, -Infinity, Infinity);
          if(val > value){
            value = val;
            bestMove = move;
          }
        }else{
          const val = this.min(next, this.depth-1, -Infinity, Infinity);
          if(val < value){
            value = val;
            bestMove = move;
          }
        }
      }catch(err){ continue; }
    }
    return bestMove;
  }
  private min(board: Board, depth: number, alpha: number, beta: number){
    if(Board.gameEnded(board) || depth <= 0) 
      return this.evaluator.evaluate(board, depth);
    let minValue = Infinity;
    for(const move of board.player.moves){
      try{
        const next = board.makeMove(move);
        const value = this.max(next, depth-1, alpha, beta);
        if(value < minValue) minValue = value;
        if(value <= alpha) break;
        if(value < beta) beta = value;
      }catch(err){ continue; }
    }
    return minValue;
  }
  private max(board: Board, depth: number, alpha: number, beta: number){
    if(Board.gameEnded(board) || depth <= 0) 
      return this.evaluator.evaluate(board, depth);
    let maxValue = -Infinity;
    for(const move of board.player.moves){
      try{
        const next = board.makeMove(move);
        const value = this.min(next, depth-1, alpha, beta);
        if(value > maxValue) maxValue = value;
        if(value >= beta) break;
        if(value > alpha) alpha = value;
      }catch(err){ continue; }
    }
    return maxValue;
  }
}