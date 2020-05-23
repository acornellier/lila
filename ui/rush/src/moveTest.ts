import { path as pathOps } from 'tree';
import { altCastles, decomposeUci, sanToRole } from 'chess';
import { MoveTest, Puzzle, Vm } from './interfaces';

export default function(vm: Vm, puzzle: Puzzle): () => undefined | 'fail' | 'win' | MoveTest {

  return function(): undefined | 'fail' | 'win' | MoveTest {
    if (!pathOps.contains(vm.path, vm.initialPath)) return;

    let playedByColor = vm.node.ply % 2 === 1 ? 'white' : 'black';
    if (playedByColor !== puzzle.color) return;

    let nodes = vm.nodeList.slice(pathOps.size(vm.initialPath) + 1).map(function(node) {
      return {
        uci: node.uci,
        castle: node.san!.startsWith('O-O')
      };
    });

    let progress = puzzle.lines;
    for (let i in nodes) {
      if (progress[nodes[i].uci!]) progress = progress[nodes[i].uci!];
      else if (nodes[i].castle) progress = progress[altCastles[nodes[i].uci!]] || 'fail';
      else progress = 'fail';
      if (typeof progress === 'string') break;
    }
    if (typeof progress === 'string') {
      vm.node.puzzle = progress;
      return progress;
    }

    let nextKey = Object.keys(progress)[0];
    if (progress[nextKey] === 'win') {
      vm.node.puzzle = 'win';
      return 'win';
    }

    // from here we have a next move

    vm.node.puzzle = 'good';

    let opponentUci = decomposeUci(nextKey);
    let promotion = opponentUci[2] ? sanToRole[opponentUci[2].toUpperCase()] : null;

    const move: MoveTest = {
      orig: opponentUci[0],
      dest: opponentUci[1],
      fen: vm.node.fen,
      path: vm.path
    };
    if (promotion) move.promotion = promotion;

    return move;
  };
}
