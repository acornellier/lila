import { build as treeBuild, ops as treeOps, path as treePath, TreeWrapper } from 'tree';
import keyboard from './keyboard';
import moveTestBuild from './moveTest';
import makePromotion from './promotion';
import { defined, prop } from 'common';
import * as speech from './speech';
import { sound } from './sound';
import { makeSquare, makeUci, parseSquare } from 'chessops/util';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSanAndPlay } from 'chessops/san';
import { Chess } from 'chessops/chess';
import { chessgroundDests, scalachessId } from 'chessops/compat';
import { Config as CgConfig } from 'chessground/config';
import { Api as CgApi } from 'chessground/api';
import * as cg from 'chessground/types';
import { Controller, MoveTest, Puzzle, PuzzleData, PuzzleOpts, Redraw, RushData, Vm } from './interfaces';

export default function(opts: PuzzleOpts, redraw: Redraw): Controller {
  let vm: Vm = {} as Vm;
  let data: RushData;
  let tree: TreeWrapper;
  let moveTest;

  const ground = prop<CgApi | undefined>(undefined);

  function setPath(path: Tree.Path): void {
    vm.path = path;
    vm.nodeList = tree.getNodeList(path);
    vm.node = treeOps.last(vm.nodeList)!;
    vm.mainline = treeOps.mainlineNodeList(tree.root);
  }

  function withGround<A>(f: (cg: CgApi) => A): A | undefined {
    const g = ground();
    return g && f(g);
  }

  function initRush(fromData: RushData): void {
    data = fromData;
    vm.puzzleIndex = 0;
    initPuzzle();
  }

  function initPuzzle(): void {
    tree = treeBuild(treeOps.reconstruct(curPuzzleData().game.treeParts));
    let initialPath = treePath.fromNodeList(treeOps.mainlineNodeList(tree.root));
    // play | try | view
    vm.loading = false;
    vm.justPlayed = undefined;
    vm.lastFeedback = 'init';
    vm.initialPath = initialPath;

    setPath(treePath.init(initialPath));
    setTimeout(function() {
      jump(initialPath);
      redraw();
    }, 500);

    moveTest = moveTestBuild(vm, curPuzzle());

    withGround(g => {
      g.setAutoShapes([]);
      g.setShapes([]);
      showGround(g);
    });
  }

  function position(): Chess {
    const setup = parseFen(vm.node.fen).unwrap();
    return Chess.fromSetup(setup).unwrap();
  }

  function makeCgOpts(): CgConfig {
    const node = vm.node;
    const color: Color = node.ply % 2 === 0 ? 'white' : 'black';
    const dests = chessgroundDests(position());
    const config = {
      fen: node.fen,
      orientation: curPuzzle().color,
      turnColor: color,
      movable: {
        color: (Object.keys(dests).length > 0) ? color : undefined,
        dests
      },
      premovable: {
        enabled: false
      },
      check: !!node.check,
      lastMove: uciToLastMove(node.uci)
    };
    vm.cgConfig = config;
    return config;
  }

  function curPuzzleData(): PuzzleData {
    return data.puzzles[vm.puzzleIndex];
  }

  function curPuzzle(): Puzzle {
    return curPuzzleData().puzzle;
  }

  function showGround(g: CgApi): void {
    g.set(makeCgOpts());
  }

  function userMove(orig: Key, dest: Key): void {
    vm.justPlayed = orig;
    if (!promotion.start(orig, dest, sendMove)) sendMove(orig, dest);
  }

  function sendMove(orig: Key, dest: Key, promotion?: cg.Role): void {
    const pos = position();
    const move = pos.normalizeMove({
      from: parseSquare(orig)!,
      to: parseSquare(dest)!,
      promotion
    });
    const san = makeSanAndPlay(pos, move);
    const check = pos.isCheck() ? pos.board.kingOf(pos.turn) : undefined;
    addNode({
      ply: 2 * (pos.fullmoves - 1) + (pos.turn == 'white' ? 0 : 1),
      fen: makeFen(pos.toSetup()),
      id: scalachessId(move),
      uci: makeUci(move),
      san,
      check: check ? makeSquare(check) : undefined,
      children: []
    }, vm.path);
  }

  function uciToLastMove(uci: string | undefined): [Key, Key] | undefined {
    // assuming standard chess
    return defined(uci) ? [uci.substr(0, 2) as Key, uci.substr(2, 2) as Key] : undefined;
  }

  function addNode(node: Tree.Node, path: Tree.Path): void {
    const newPath = tree.addNode(node, path)!;
    jump(newPath);
    reorderChildren(path);
    redraw();
    withGround(g => g.playPremove());

    applyProgress(moveTest());
    redraw();
    speech.node(node, false);
  }

  function reorderChildren(path: Tree.Path, recursive?: boolean): void {
    let node = tree.nodeAtPath(path);
    node.children.sort(function(c1, _) {
      if (c1.puzzle === 'fail') return 1;
      if (c1.puzzle === 'retry') return 1;
      if (c1.puzzle === 'good') return -1;
      return 0;
    });
    if (recursive) node.children.forEach(function(child) {
      reorderChildren(path + child.id, true);
    });
  };

  function revertUserMove(): void {
    setTimeout(function() {
      withGround(g => g.cancelPremove());
      userJump(treePath.init(vm.path));
      redraw();
    }, 100);
  }

  function applyProgress(progress: undefined | 'fail' | 'win' | 'retry' | MoveTest): void {
    if (!progress)
      return;

    if (progress === 'fail') {
      vm.lastFeedback = 'fail';
      sendResult(false);
    } else if (progress === 'win') {
      sendResult(true);
      vm.lastFeedback = 'win';
    } else if (progress === 'retry') {
      vm.lastFeedback = 'retry';
      revertUserMove();
    } else {
      vm.lastFeedback = 'good';
      sendMove(progress.orig, progress.dest, progress.promotion);
    }
  }

  function sendResult(win: boolean): void {
    if (win) speech.success();
    setTimeout(() => nextPuzzle(), 500);
  }

  function nextPuzzle(): void {
    vm.puzzleIndex += 1;
    initPuzzle();
    redraw();
  };

  function jump(path: Tree.Path): void {
    const pathChanged = path !== vm.path,
      isForwardStep = pathChanged && path.length === vm.path.length + 2;
    setPath(path);
    withGround(showGround);
    if (pathChanged) {
      if (isForwardStep) {
        if (!vm.node.uci) sound.move(); // initial position
        else if (!vm.justPlayed || vm.node.uci.includes(vm.justPlayed)) {
          if (vm.node.san!.includes('x')) sound.capture();
          else sound.move();
        }
        if (/[+#]/.test(vm.node.san!)) sound.check();
      }
    }
    promotion.cancel();
    vm.justPlayed = undefined;
    window.lichess.pubsub.emit('ply', vm.node.ply);
  }

  function userJump(path: Tree.Path): void {
    withGround(g => g.selectSquare(null));
    jump(path);
    speech.node(vm.node, true);
  }

  initRush(opts.data);

  const promotion = makePromotion(vm, ground, redraw);

  keyboard({
    vm,
    userJump,
    redraw
  });

  // If the page loads while being hidden (like when changing settings),
  // chessground is not displayed, and the first move is not fully applied.
  // Make sure chessground is fully shown when the page goes back to being visible.
  document.addEventListener('visibilitychange', function() {
    window.lichess.requestIdleCallback(function() {
      jump(vm.path);
    });
  });

  speech.setup();

  return {
    vm,
    curPuzzle,
    getData() {
      return curPuzzleData();
    },
    getTree() {
      return tree;
    },
    ground,
    makeCgOpts,
    userJump,
    nextPuzzle,
    pref: opts.pref,
    trans: window.lichess.trans(opts.i18n),
    userMove,
    getOrientation() {
      return withGround(g => g.state.orientation)!;
    },
    getNode() {
      return vm.node;
    },
    promotion,
    redraw,
    ongoing: false
  };
}
