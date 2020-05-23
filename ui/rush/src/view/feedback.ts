import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { spinner } from '../util';
import { Controller, MaybeVNode } from '../interfaces';

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
  if (ctrl.vm.lastFeedback === 'win') return win();
  if (ctrl.vm.lastFeedback === 'fail') return fail();
  return;
}
