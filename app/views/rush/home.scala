package views.rush

import controllers.routes
import lila.api.Context
import lila.app.templating.Environment._
import lila.app.ui.ScalatagsTemplate._
import lila.common.String.html.safeJsonValue
import play.api.libs.json.{ JsObject, Json }

object home {
  def apply(data: JsObject, pref: JsObject)(implicit ctx: Context) =
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
            "pref" -> pref,
            "i18n" -> bits.jsI18n()
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
        div(cls := "rush__board main-board")(chessgroundBoard),
        div(cls := "rush__tools")
      )
    }
}
