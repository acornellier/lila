package controllers

import lila.api.Context
import lila.app._
import lila.forum
import play.api.mvc._

private[controllers] trait ForumController extends forum.Granter { self: LilaController =>

  protected def categApi = env.forum.categApi
  protected def topicApi = env.forum.topicApi
  protected def postApi  = env.forum.postApi
  protected def forms    = env.forum.forms

  protected def teamCache = env.team.cached

  protected def userBelongsToTeam(teamId: String, userId: String): Fu[Boolean] =
    env.team.api.belongsTo(teamId, userId)

  protected def userOwnsTeam(teamId: String, userId: String): Fu[Boolean] =
    env.team.api.leads(teamId, userId)

  protected def canAccesTeamForum(teamId: String, userId: String): Fu[Boolean] =
    env.team.api.canAccessForum(teamId, userId)

  protected def CategGrantWrite[A <: Result](
      categSlug: String
  )(a: => Fu[A])(implicit ctx: Context): Fu[Result] =
    isGrantedWrite(categSlug) flatMap { granted =>
      if (granted) a
      else fuccess(Forbidden("You cannot post to this category"))
    }

  protected def CategGrantMod[A <: Result](
      categSlug: String
  )(a: => Fu[A])(implicit ctx: Context): Fu[Result] =
    isGrantedMod(categSlug) flatMap { granted =>
      if (granted | isGranted(_.ModerateForum)) a
      else fuccess(Forbidden("You cannot post to this category"))
    }

  protected def CategForumAccess[A <: Result](
    categSlug: String
  )(a: => Fu[A])(implicit ctx: Context): Fu[Result] =
    NotForKids {
      canAccessForum(categSlug) flatMap {
        if (_) a
        else fuccess(Forbidden("You cannot access this private forum"))
      }
    }
}
