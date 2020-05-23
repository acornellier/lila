import { h } from 'snabbdom';
import { Controller, MaybeVNode } from '../interfaces';

export default function(ctrl: Controller): MaybeVNode {
  return h('div.rush__feedback.after', [
    h('div.half.half-top', [
      ctrl.vm.lastFeedback === 'win' ? h('div.complete.feedback.win', h('div.player', [
        h('div.icon', '✓'),
        h('div.instruction', 'Success!')
      ])) : h('div.complete', 'Puzzle complete!')
    ])
  ]);
}
