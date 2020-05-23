package controllers

import lila.api.Context
import lila.app._
import lila.puzzle.{ Puzzle, UserInfos }

final class Rush(
    env: Env,
) extends LilaController(env) {
  private def renderShow(puzzles: Seq[Puzzle])(implicit ctx: Context) =
    env.rush.jsonView(puzzles) map { json =>
      EnableSharedArrayBuffer(
        Ok(views.rush.home(data = json, pref = env.puzzle.jsonView.pref(ctx.pref)))
      )
    }

  def home =
    Open { implicit ctx =>
      NoBot {
        env.rush.api() flatMap { puzzles =>
          renderShow(puzzles)
        }
      }
    }
}
