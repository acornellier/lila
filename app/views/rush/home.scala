package views.rush

import lila.api.Context
import lila.app.ui.ScalatagsTemplate._

object home {
  def apply()(implicit ctx: Context) =
    views.html.base.layout(
      title = "Rush"
    )(
      main(cls := "page-small box box-pad page rush-home")(
        h1("Rush [BETA]"),
      )
    )
}
