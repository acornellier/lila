import { h } from 'snabbdom';
import { bind, dataIcon } from '../util';
import { Controller, MaybeVNode } from '../interfaces';

export default function(ctrl: Controller): MaybeVNode {
  const data = ctrl.getData();
  const voteCall = !!data.user && ctrl.callToVote() && data.puzzle.enabled && data.voted === undefined;
  return h('div.rush__feedback.after' + (voteCall ? '.call' : ''), [
    h('div.half.half-top', [
      ctrl.vm.lastFeedback === 'win' ? h('div.complete.feedback.win', h('div.player', [
        h('div.icon', '✓'),
        h('div.instruction', 'Success!')
      ])) : h('div.complete', 'Puzzle complete!')
    ]),
    h('a.half.continue', {
      hook: bind('click', ctrl.nextPuzzle)
    }, [
      h('i', { attrs: dataIcon('G') }),
      'Continue training'
    ])
  ]);
}
