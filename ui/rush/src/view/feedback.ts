import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { spinner } from '../util';
import { Controller, MaybeVNode } from '../interfaces';

function initial(ctrl: Controller): VNode {
  const puzzleColor = ctrl.curPuzzle().color;
  return h('div.rush__feedback.play', [
    h('div.player', [
      h('div.no-square', h('piece.king.' + puzzleColor)),
      h('div.instruction', [
        h('strong', `Rating: ${ctrl.curPuzzle().rating}`),
        h('strong', `Find the best move for ${puzzleColor}`)
      ])
    ]),
  ]);
}

function fail(): VNode {
  return h('div.rush__feedback.fail', [
    h('div.player', [
      h('div.icon', '✗'),
      h('div.instruction', [
        h('strong', 'Puzzle failed')
      ])
    ])
  ]);
}

function good(): VNode {
  return h('div.rush__feedback.good', [
    h('div.player', [
      h('div.icon', '✓'),
      h('div.instruction', [
        h('strong', 'Best move'),
        h('em', 'Keep going')
      ])
    ]),
  ]);
}

function retry(): VNode {
  return h('div.rush__feedback.retry', [
    h('div.player', [
      h('div.icon', '!'),
      h('div.instruction', [
        h('strong', 'Good move'),
        h('em', 'But you can do better')
      ])
    ]),
  ]);
}

function win(): MaybeVNode {
  return h('div.rush__feedback.after', [
    h('div.half.half-top', [
      h('div.complete.feedback.win', h('div.player', [
        h('div.icon', '✓'),
        h('div.instruction', 'Success!')
      ]))
    ])
  ]);
}

function loading(): VNode {
  return h('div.rush__feedback.loading', spinner());
}

export default function(ctrl: Controller): MaybeVNode {
  if (ctrl.vm.loading) return loading();
  if (ctrl.vm.lastFeedback === 'good') return good();
  if (ctrl.vm.lastFeedback === 'win') return win();
  if (ctrl.vm.lastFeedback === 'retry') return retry();
  if (ctrl.vm.lastFeedback === 'fail') return fail();
  return initial(ctrl);
}
