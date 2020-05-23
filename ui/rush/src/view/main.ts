import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import chessground from './chessground';
import * as control from '../control';
import feedbackView from './feedback';
import historyView from './history';
import * as gridHacks from './gridHacks';
import { bind } from '../util';
import { Controller } from '../interfaces';

function wheel(ctrl: Controller, e: WheelEvent): false | undefined {
  const target = e.target as HTMLElement;
  if (target.tagName !== 'PIECE' && target.tagName !== 'SQUARE' && target.tagName !== 'CG-BOARD') return;
  e.preventDefault();
  if (e.deltaY > 0) control.next(ctrl);
  else if (e.deltaY < 0) control.prev(ctrl);
  ctrl.redraw();
  return false;
}

export default function(ctrl: Controller): VNode {
  return h('main.rush', {
    hook: {
      postpatch(_, vnode) {
        gridHacks.start(vnode.elm as HTMLElement);
      }
    }
  }, [
    h('div.rush__board.main-board' + (ctrl.pref.blindfold ? '.blindfold' : ''), {
      hook: window.lichess.hasTouchEvents ? undefined : bind('wheel', e => wheel(ctrl, e as WheelEvent))
    }, [
      chessground(ctrl),
      ctrl.promotion.view()
    ]),
    h('div.rush__tools', [feedbackView(ctrl)]),
    historyView(ctrl)
  ]);
}
