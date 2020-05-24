import { h } from 'snabbdom';
import { Controller, MaybeVNode } from '../interfaces';

export default function(ctrl: Controller): MaybeVNode {
  return h('div.rush__progress', ctrl.vm.progress.map(({puzzle, win}) => {
    return h('a', {
      class: {
        win: win,
        loss: !win
      },
      attrs: { href: '/training/' + puzzle.id }
    }, puzzle.rating.toString())
  }))
}
