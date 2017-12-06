const { pipe, anyOf, autoCurry } = require('./tools')


const generateMove = () => anyOf([0, 1, 2, 3])


const makeGameWith = autoCurry((game, changes) =>
  Object.assign({}, game, changes))


const newGame = (isStrict, { onOk, onError, onNewRound, onWin }) =>
  pipe(f => x => { f(x); return x; },
    map => ({
      expectedMoves: [generateMove()],
      madeMoves: [],
      isStrict: isStrict,
      callbacks: {
        onOk: map(onOk),
        onError: map(onError),
        onNewRound: map(onNewRound),
        onWin: map(onWin)
      }
    }))


const makeMove = autoCurry((move, game) => {
  const { madeMoves, expectedMoves, isStrict, callbacks } = game
  const { onOk, onError, onWin, onNewRound } = callbacks

  const wrongMove = move !== expectedMoves[madeMoves.length]

  const makeGame = makeGameWith(game)

  if (wrongMove) return pipe(
    isStrict ? [generateMove()] : expectedMoves,
    ms => makeGame({ madeMoves: [], expectedMoves: ms }),
    onError, onNewRound)

  const roundIsOver = madeMoves.length + 1 === expectedMoves.length
  const gameIsOver = roundIsOver && expectedMoves.length === 20

  return gameIsOver ?
    pipe({ madeMoves: [], expectedMoves: [generateMove()] },
      makeGame, onOk, onWin, onNewRound) :
    roundIsOver ?
    pipe({ madeMoves: [], expectedMoves: expectedMoves.concat(generateMove()) },
      makeGame, onOk, onNewRound) :
    pipe({ madeMoves: madeMoves.concat(move) },
      makeGame, onOk)
})


module.exports = { newGame, makeMove }
