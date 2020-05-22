package views.rush

import play.api.libs.json.{ JsObject, Json }
import lila.api.Context
import lila.app.templating.Environment._
import lila.app.ui.ScalatagsTemplate._
import lila.common.String.html.safeJsonValue

import controllers.routes

object home {
  def apply(puzzle: lila.puzzle.Puzzle, data: JsObject, pref: JsObject)(implicit ctx: Context) =
    views.html.base.layout(
      title = "Rush",
      moreCss = cssTag("rush"),
      moreJs = frag(
        jsTag("vendor/sparkline.min.js"),
        jsAt(s"compiled/lichess.rush${isProd ?? ".min"}.js"),
        embedJsUnsafe(s"""
lichess = lichess || {};
lichess.rush = ${safeJsonValue(
          Json.obj(
            "data" -> data,
            "pref" -> pref
          )
        )}""")
      ),
      csp = defaultCsp.withWebAssembly.some,
      chessground = false,
      openGraph = lila.app.ui
        .OpenGraph(
          title = s"Lichess Rush",
          url = s"$netBaseUrl${routes.Rush.home()}",
          description = s"Lichess Rush"
        )
        .some,
      zoomable = true
    ) {
      main(cls := "rush")(
        st.aside(cls := "rush__side")(
          div(cls := "rush__side__metas")(spinner)
        ),
        div(cls := "rush__board main-board")(chessgroundBoard),
        div(cls := "rush__tools"),
        div(cls := "rush__controls"),
        div(cls := "rush__history")
      )
    }
}
