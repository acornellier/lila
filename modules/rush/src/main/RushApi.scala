package lila.rush

import lila.db.dsl._
import lila.puzzle.Puzzle
import lila.puzzle.Puzzle.{ BSONFields => F }

final class RushApi(
    puzzle: lila.puzzle.Env
)(implicit ec: scala.concurrent.ExecutionContext) {
  def apply(): Fu[Seq[Puzzle]] = {
    puzzle puzzleColl { coll =>
      (800 to 3000 by 40) map { n =>
        tryRange(
          coll = coll,
          rating = n,
          tolerance = 20,
          step = 20
        )
      } sequenceFu
    }
  }

  private def tryRange(coll: Coll, rating: Int, tolerance: Int, step: Int): Fu[Puzzle] =
    coll.ext
      .find($doc(F.rating $gt (rating - tolerance) $lt (rating + tolerance)))
      .one[Puzzle] flatMap {
      case None if (tolerance + step) <= 1000 => tryRange(coll, rating, tolerance + step, step)
      case Some(res)                          => fuccess(res)
    }
}
