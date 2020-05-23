package lila.rush

import lila.puzzle.{ Line, Puzzle, Round }
import lila.tree
import lila.tree.Node.defaultNodeJsonWriter
import play.api.libs.json._

import scala.concurrent.Future

final class JsonView(
    gameJson: GameJson
)(implicit ec: scala.concurrent.ExecutionContext) {
  def apply(puzzles: Seq[Puzzle]): Fu[JsObject] =
    jsons(puzzles) map { jsons => Json.obj("puzzles" -> JsArray(jsons)) }

  private def jsons(puzzles: Seq[Puzzle]): Fu[Seq[JsObject]] =
    Future.sequence(
      puzzles map { puzzle: Puzzle =>
        gameJson(puzzle.gameId, puzzle.initialPly) map { gameJson =>
          Json.obj(
            "game"   -> gameJson,
            "puzzle" -> puzzleJson(puzzle)
          )
        }
      }
    )

  private def puzzleJson(puzzle: Puzzle): JsObject =
    Json
      .obj(
        "id"         -> puzzle.id,
        "rating"     -> puzzle.perf.intRating,
        "attempts"   -> puzzle.attempts,
        "fen"        -> puzzle.fen,
        "color"      -> puzzle.color.name,
        "initialPly" -> puzzle.initialPly,
        "gameId"     -> puzzle.gameId,
        "lines"      -> lila.puzzle.Line.toJson(puzzle.lines),
        "vote"       -> puzzle.vote.sum
      )
      .add("branch" -> makeBranch(puzzle).map(defaultNodeJsonWriter.writes))
      .add("enabled" -> puzzle.enabled)

  private def makeBranch(puzzle: Puzzle): Option[tree.Branch] = {
    import chess.format._
    val fullSolution: List[Uci.Move] = (Line solution puzzle.lines).map { uci =>
      Uci.Move(uci) err s"Invalid puzzle solution UCI $uci"
    }
    val solution =
      if (fullSolution.isEmpty) {
        logger.warn(s"Puzzle ${puzzle.id} has an empty solution from ${puzzle.lines}")
        fullSolution
      } else if (fullSolution.size % 2 == 0) fullSolution.init
      else fullSolution
    val init = chess.Game(none, puzzle.fenAfterInitialMove).withTurns(puzzle.initialPly)
    val (_, branchList) = solution.foldLeft[(chess.Game, List[tree.Branch])]((init, Nil)) {
      case ((prev, branches), uci) =>
        val (game, move) =
          prev(uci.orig, uci.dest, uci.promotion).prefixFailuresWith(s"puzzle ${puzzle.id}").err
        val branch = tree.Branch(
          id = UciCharPair(move.toUci),
          ply = game.turns,
          move = Uci.WithSan(move.toUci, game.pgnMoves.last),
          fen = chess.format.Forsyth >> game,
          check = game.situation.check,
          crazyData = none
        )
        (game, branch :: branches)
    }
    branchList.foldLeft[Option[tree.Branch]](None) {
      case (None, branch)        => branch.some
      case (Some(child), branch) => Some(branch addChild child)
    }
  }
}

object JsonView {
  def round(r: Round): JsObject =
    Json.obj(
      "ratingDiff" -> r.ratingDiff,
      "win"        -> r.result.win
    )
}
