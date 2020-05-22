package controllers

import lila.api.Context
import lila.app._
import lila.puzzle.UserInfos
import play.api.libs.json.JsObject

final class Rush(
    env: Env,
    apiC: => Api
) extends LilaController(env) {
  private def renderJson(
      puzzle: lila.puzzle.Puzzle,
      userInfos: Option[UserInfos],
      mode: String,
      voted: Option[Boolean],
      round: Option[lila.puzzle.Round] = None
  )(implicit ctx: Context): Fu[JsObject] =
    env.puzzle.jsonView(
      puzzle = puzzle,
      userInfos = userInfos,
      round = round,
      mode = mode,
      mobileApi = ctx.mobileApiVersion,
      voted = voted
    )

  private def renderShow(puzzle: lila.puzzle.Puzzle, mode: String)(implicit ctx: Context) =
    env.puzzle userInfos ctx.me flatMap { infos =>
      renderJson(puzzle = puzzle, userInfos = infos, mode = mode, voted = none) map { json =>
        EnableSharedArrayBuffer(
          Ok(views.rush.home(puzzle, data = json, pref = env.puzzle.jsonView.pref(ctx.pref)))
        )
      }
    }

  def home =
    Open { implicit ctx =>
      NoBot {
        env.puzzle.selector(ctx.me) flatMap { puzzle =>
          renderShow(puzzle, if (ctx.isAuth) "play" else "try")
        }
      }
    }
}
