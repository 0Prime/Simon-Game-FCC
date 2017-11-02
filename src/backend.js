const { pipe, anyOf, autoCurry } = require('./tools')


const generateMove = () => anyOf([0, 1, 2, 3])


const makeGame = autoCurry((isStrict, expected, made, status) => ({
  expectedMoves: expected,
  madeMoves: made,
  isStrict: isStrict,
  status: status
}))


const statuses = {
  newRound: 'new round',
  win: 'win',
  ok: 'ok'
}


const newGame = isStrict =>
  makeGame(isStrict, [generateMove()], [], statuses.newRound)


const makeMove = autoCurry((move, game) => {
  const { madeMoves, expectedMoves, status, isStrict } = game

  if (status === statuses.win)
    return game

  const _makeGame = makeGame(isStrict)
  const wrongMove = move !== expectedMoves[madeMoves.length]

  if (wrongMove)
    return isStrict ? newGame(isStrict) : _makeGame(game.expectedMoves, [], statuses.newRound)

  const newMoves = madeMoves.concat(move)
  const roundIsOver = madeMoves.length + 1 === expectedMoves.length
  const gameIsOver = roundIsOver && expectedMoves.length === 20

  return gameIsOver ? _makeGame(expectedMoves, newMoves, statuses.win) :
    roundIsOver ? _makeGame(expectedMoves.concat(generateMove()), [], statuses.newRound) :
    _makeGame(expectedMoves, newMoves, statuses.ok)
})


module.exports = {
  newGame: newGame,
  makeMove: makeMove
}
