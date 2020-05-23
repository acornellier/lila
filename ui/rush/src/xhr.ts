import { PuzzleData, PuzzleRound } from './interfaces';

// do NOT set mobile API headers here
// they trigger a compat layer
export function round(puzzleId: number, win: boolean): JQueryPromise<PuzzleRound> {
  return $.ajax({
    method: 'POST',
    url: `/training/${puzzleId}/round2`,
    data: {
      win: win ? 1 : 0
    }
  });
}

export function nextPuzzle(): JQueryPromise<PuzzleData> {
  return $.ajax({
    url: '/training/new'
  });
}
