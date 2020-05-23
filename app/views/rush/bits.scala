package views.rush

import lila.app.templating.Environment._
import lila.app.ui.ScalatagsTemplate._
import play.api.i18n.Lang

object bits {
  def jsI18n()(implicit lang: Lang) = i18nJsObject(i18nKeys)

  private val i18nKeys = List(
    // ceval
    trans.depthX,
    trans.usingServerAnalysis,
    trans.loadingEngine,
    trans.cloudAnalysis,
    trans.goDeeper,
    trans.showThreat,
    trans.gameOver,
    trans.inLocalBrowser,
    trans.toggleLocalEvaluation
  ).map(_.key)
}
