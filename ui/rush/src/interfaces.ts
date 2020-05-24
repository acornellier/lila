import { Prop } from 'common';
import { TreeWrapper } from 'tree';
import { VNode } from 'snabbdom/vnode';
import { Api as CgApi } from 'chessground/api';
import { Config as CgConfig } from 'chessground/config';
import { Role } from 'chessground/types';

export type MaybeVNode = VNode | string | null | undefined;
export type MaybeVNodes = MaybeVNode[];

export type Redraw = () => void;

export interface KeyboardController {
  vm: Vm;
  redraw: Redraw;
  userJump(path: Tree.Path): void;
}

export interface Controller extends KeyboardController {
  ongoing: boolean;
  getOrientation(): Color;
  getNode(): Tree.Node;
  trans: Trans;
  curPuzzle(): Puzzle,
  getData(): PuzzleData;
  getTree(): TreeWrapper;
  ground: Prop<CgApi | undefined>;
  makeCgOpts(): CgConfig;
  nextPuzzle(): void;
  pref: PuzzlePrefs;
  userMove(orig: Key, dest: Key): void;
  promotion: any;

  path?: Tree.Path;
  autoScrollRequested?: boolean;
}

export interface Vm {
  puzzleIndex: number
  progress: PuzzleProgress[]
  path: Tree.Path;
  nodeList: Tree.Node[];
  node: Tree.Node;
  mainline: Tree.Node[];
  loading: boolean;
  justPlayed?: Key;
  lastFeedback: 'init' | 'fail' | 'win' | 'retry' | 'good';
  initialPath: Tree.Path;
  cgConfig: CgConfig;
}

export interface PuzzleProgress {
  puzzle: Puzzle
  win: boolean
}

export interface PuzzleOpts {
  pref: PuzzlePrefs;
  data: RushData;
  i18n: { [key: string]: string | undefined };
  element: HTMLElement;
}

export interface PuzzlePrefs {
  coords: 0 | 1 | 2;
  is3d: boolean;
  destination: boolean;
  rookCastle: boolean;
  moveEvent: number;
  highlight: boolean;
  resizeHandle: number;
  animation: {
    duration: number;
  };
  blindfold: boolean;
}

export interface PuzzleData {
  puzzle: Puzzle;
  game: {
    treeParts: Tree.Node[];
  };
}

export interface RushData {
  puzzles: PuzzleData[];
}

export interface Puzzle {
  id: number;
  enabled: boolean;
  color: Color;
  lines: Lines;
  branch: any;
  rating: number,
}

export interface Promotion {
  start(orig: Key, dest: Key, callback: (orig: Key, dest: Key, prom: Role) => void): boolean;
  cancel(): void;
  view(): MaybeVNode;
}

export type Lines = { [uci: string]: Lines } | 'fail' | 'win';

export interface MoveTest {
  orig: Key;
  dest: Key;
  promotion?: Role;
  fen: Fen;
  path: Tree.Path;
}
