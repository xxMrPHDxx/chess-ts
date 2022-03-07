import Board from "./board";
import { MovesHintManager } from "./hintsmanager";

type ClickListener = (pos?: number) => void;
type FirstClickListener = (pos: number) => boolean;
type SecondClickListener = (source: number, destination: number) => void;
type RedrawListener = () => void;

export class MouseInput {
  private _hints: MovesHintManager;
  private source: number = null;

  private clickListener: ClickListener = null;
  private firstClickListener: FirstClickListener = null;
  private secondClickListener: SecondClickListener = null;
  private redrawListener: RedrawListener = null;

  constructor(owner: HTMLCanvasElement, size: number){
    this._hints = new MovesHintManager(owner, size);
    owner.addEventListener('contextmenu', e => e.preventDefault());
    owner.addEventListener('mousedown', (e: MouseEvent) => {
      if(e.buttons === 1){
        const col = (e.offsetX / size)|0, row = (e.offsetY / size)|0;
        const idx = row * 8 + col;
        if(!Board.isValidPosition(idx)) return;
        if(this.source === null){
          if(this.firstClickListener !== null && this.firstClickListener(idx)) this.source = idx;
          else return;
        }else if(this.source !== idx){
          if(this.secondClickListener !== null) this.secondClickListener(this.source, idx);
          this.source = null;
          this._hints.clear();
        }
        if(this.clickListener !== null) this.clickListener(idx);
      }else if(e.buttons === 2){
        this.source = null;
        this._hints.clear();
      }
      if(this.redrawListener !== null) this.redrawListener();
    });
  }

  get hints(): MovesHintManager { return this._hints; }

  set onclick(listener: ClickListener){ this.clickListener = listener; }
  set onfirstclick(listener: FirstClickListener){ this.firstClickListener = listener; }
  set onsecondclick(listener: SecondClickListener){ this.secondClickListener = listener; }
  set onredraw(listener: RedrawListener){ this.redrawListener = listener; }
}