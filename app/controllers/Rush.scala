package controllers

import lila.app._

final class Rush(env: Env) extends LilaController(env) {
  def home =
    Open { implicit ctx =>
      Ok(views.rush.home()).fuccess
    }
}
