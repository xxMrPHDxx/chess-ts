import Board from "../board";
import { Type } from "../piece";
import Player from "../player";

const CHECK_MATE_BONUS = 10000;
const CHECK_BONUS = 45;
const CASTLE_BONUS = 25;
const MOBILITY_MULTIPLIER = 5;
const ATTACK_MULTIPLIER = 1;
const TWO_BISHOPS_BONUS = 25;

export default abstract class BoardEvaluator {
  abstract evaluate(board: Board, depth: number): number;
}

export class Default extends BoardEvaluator {
  evaluate(board: Board, depth: number): number {
    return this.evaluatePlayer(board.white, board.black, depth) - 
      this.evaluatePlayer(board.black, board.white, depth);
  }

  private evaluatePlayer(player: Player, opponent: Player, depth: number): number {
    return this.mobility(player, opponent) + 
      this.kingThreats(player, depth) +
      this.attacks(player) +
      this.castle(player) +
      this.pieces(player) +
      this.pawnStructure(player);
  }

  private mobility(player: Player, opponent: Player): number {
    return MOBILITY_MULTIPLIER * player.moves.size * 10 / opponent.moves.size;
  }

  private kingThreats(player: Player, depth: number): number {
    return player.checkmate ? CHECK_MATE_BONUS * this.depthBonus(depth) : this.check(player);
  }

  private attacks(player: Player): number {
    let attackScore = 0;
    for(const move of player.moves){
      if(move.attack){
        if(Default.getPieceValue(move.piece.type) <= Default.getPieceValue(move.target.piece.type))
          attackScore++;
      }
    }
    return attackScore * ATTACK_MULTIPLIER;
  }

  private castle(player: Player): number {
    return 0; // TODO: Implement castled flag in player?
  }

  private check(player: Player): number {
    return player.check ? CHECK_BONUS : 0;
  }

  private depthBonus(depth: number): number {
    return depth === 0 ? 1 : depth * 100;
  }
  
  private pieces(player: Player): number {
    let total = 0;
    for(const piece of player.pieces)
      total += Default.getPieceValue(piece.type);
    return total;
  }

  private pawnStructure(player: Player): number {
    return 0; // TODO: Implement later!
  }

  private static getPieceValue(type: Type){
    switch(type){
      case Type.R: return 500;
      case Type.N: return 300;
      case Type.B: return 330;
      case Type.Q: return 900;
      case Type.K: return 10000;
      case Type.P: return 100;
      default: return 0;
    }
  }
}