import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode';
import afterView from './after';
import { bind, spinner } from '../util';
import { Controller, MaybeVNode } from '../interfaces';

function viewSolution(ctrl: Controller): VNode {
  return h('div.view_solution', {
    class: { show: ctrl.vm.canViewSolution }
  }, [
    h('a.button.button-empty', {
      hook: bind('click', ctrl.viewSolution)
    }, 'View the solution')
  ]);
}

function initial(ctrl: Controller): VNode {
  var puzzleColor = ctrl.getData().puzzle.color;
  return h('div.rush__feedback.play', [
    h('div.player', [
      h('div.no-square', h('piece.king.' + puzzleColor)),
      h('div.instruction', [
        h('strong', 'Your turn'),
        h('em', `Find the best move for ${puzzleColor}`)
      ])
    ]),
    viewSolution(ctrl)
  ]);
}

function good(ctrl: Controller): VNode {
  return h('div.rush__feedback.good', [
    h('div.player', [
      h('div.icon', '✓'),
      h('div.instruction', [
        h('strong', 'Best move'),
        h('em', 'Keep going')
      ])
    ]),
    viewSolution(ctrl)
  ]);
}

function retry(ctrl: Controller): VNode {
  return h('div.rush__feedback.retry', [
    h('div.player', [
      h('div.icon', '!'),
      h('div.instruction', [
        h('strong', 'Good move'),
        h('em', 'But you can do better')
      ])
    ]),
    viewSolution(ctrl)
  ]);
}

function fail(ctrl: Controller): VNode {
  return h('div.rush__feedback.fail', [
    h('div.player', [
      h('div.icon', '✗'),
      h('div.instruction', [
        h('strong', 'Puzzle failed'),
        h('em', 'But you can keep trying')
      ])
    ]),
    viewSolution(ctrl)
  ]);
}

function loading(): VNode {
  return h('div.rush__feedback.loading', spinner());
}

export default function(ctrl: Controller): MaybeVNode {
  if (ctrl.vm.loading) return loading();
  if (ctrl.vm.mode === 'view') return afterView(ctrl);
  if (ctrl.vm.lastFeedback === 'init') return initial(ctrl);
  if (ctrl.vm.lastFeedback === 'good') return good(ctrl);
  if (ctrl.vm.lastFeedback === 'retry') return retry(ctrl);
  if (ctrl.vm.lastFeedback === 'fail') return fail(ctrl);
  return;
}
