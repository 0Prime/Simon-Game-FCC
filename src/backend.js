const { pipe, anyOf, autoCurry } = require('./tools')


const generateMove = () => anyOf([0, 1, 2, 3])


const makeGame = autoCurry((isStrict, expected, made, isOver) => ({
  expectedMoves: expected,
  madeMoves: made,
  isOver: isOver,
  isStrict: isStrict
}))


const newGame = isStrict =>
  makeGame(isStrict, [generateMove()], [], false)


const makeMove = autoCurry((move, game) => {
  const { madeMoves, expectedMoves, isOver, isStrict } = game

  if (isOver)
    return game

  const wrongMove = move !== expectedMoves[madeMoves.length]

  if (wrongMove)
    return isStrict ? newGame(isStrict) : game

  const newMoves = madeMoves.concat(move)
  const roundIsOver = madeMoves.length + 1 === expectedMoves.length
  const gameIsOver = roundIsOver && expectedMoves.length === 20

  return pipe(makeGame(isStrict),
    gameOf => gameIsOver ? gameOf(expectedMoves, newMoves, true) :
    roundIsOver ? gameOf(expectedMoves.concat(generateMove()), [], false) :
    gameOf(expectedMoves, newMoves, false))
})


module.exports = {
  newGame: newGame,
  makeMove: makeMove
}
