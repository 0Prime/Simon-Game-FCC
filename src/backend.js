const { pipe, anyOf, autoCurry } = require('./tools')


const generateMove = () => anyOf([0, 1, 2, 3])


const makeGame = autoCurry((isStrict, expected, made, callbacks) => ({
  expectedMoves: expected,
  madeMoves: made,
  isStrict: isStrict,
  callbacks: callbacks
}))


const makeGameWith = autoCurry((game, { expectedMoves, madeMoves, callbacks, isStrict }) => ({
  expectedMoves: expectedMoves || game.expectedMoves,
  madeMoves: madeMoves || game.madeMoves,
  isStrict: isStrict || game.isStrict, // fixme maybe // undefined test!  
  callbacks: callbacks || game.callbacks
}))


const newGame = (isStrict, callbacks) => ({
  expectedMoves: [generateMove()],
  madeMoves: [],
  isStrict: isStrict,
  callbacks: callbacks
})


const makeMove = autoCurry((move, game) => {
  const { madeMoves, expectedMoves, isStrict, callbacks } = game
  const { onOk, onError, onWin, onNewRound } = callbacks

  const wrongMove = move !== expectedMoves[madeMoves.length]

  const makeGame = makeGameWith(game)

  if (wrongMove) {
    if (isStrict) {
      const ret = makeGame({ madeMoves: [], expectedMoves: [generateMove()] })
      onError(ret)
      onNewRound(ret)
      return ret
    } else {
      const ret = makeGame({ madeMoves: [] })
      onError(ret)
      onNewRound(ret)
      return ret
    }
  }


  const newMoves = madeMoves.concat(move)
  const roundIsOver = madeMoves.length + 1 === expectedMoves.length
  const gameIsOver = roundIsOver && expectedMoves.length === 20


  if (gameIsOver) {
    const ret = makeGame({ madeMoves: [], expectedMoves: [generateMove()] })
    onOk(ret)
    onWin(ret)
    onNewRound(ret)
    return ret
  }

  if (roundIsOver) {
    const ret = makeGame({ expectedMoves: expectedMoves.concat(generateMove()), madeMoves: [] })
    onOk(ret)
    onNewRound(ret)
    return ret
  }

  const ret = makeGame({ madeMoves: newMoves })
  onOk(ret)
  return ret
})


module.exports = {
  newGame: newGame,
  makeMove: makeMove
}
