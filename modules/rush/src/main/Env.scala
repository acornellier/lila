package lila.rush

import com.softwaremill.macwire._

@Module
final class Env(
    puzzleEnv: lila.puzzle.Env,
    lightUserApi: lila.user.LightUserApi,
    cacheApi: lila.memo.CacheApi,
    gameRepo: lila.game.GameRepo,
)(implicit ec: scala.concurrent.ExecutionContext) {
  lazy val api: RushApi = wire[RushApi]

  private lazy val gameJson = wire[GameJson]

  lazy val jsonView = wire[JsonView]
}
