const { last, flip, intersection, pipe, repeat } = require('./tools')
const { newGame, makeMove } = require('./backend')

const doNothing = () => {}
const stubCallbacks = {
  onError: doNothing,
  onNewRound: doNothing,
  onOk: doNothing,
  onWin: doNothing
}


describe(`simon game`, () => {
  it(`has expected moves only of four types`, () => {
    /**
     * In highly unlikely situation when random generator
     * fails to generate at least one of each 4 possible moves in 1000 iterations
     * this test will fail
     */
    const generatedMoves = []
    repeat(() =>
      generatedMoves.push(newGameWithStubCallbacks(false).expectedMoves[0]), 1000)

    const allowedMoves = [0, 1, 2, 3]
    const result = intersection(allowedMoves, generatedMoves)

    const wrongMoves = generatedMoves.filter(m => !allowedMoves.includes(m))

    expect(wrongMoves).toHaveLength(0)
    expect(result).toHaveLength(allowedMoves.length)
  })


  describe(`function makeMove`, () => {
    describe(`callback handling`, () => {

      describe(`correct move triggers 'onOk' callback`, () => {

        testOnOkCallback({ rounds: 5, moves: 2, isStrict: true })
        testOnOkCallback({ rounds: 9, moves: 6, isStrict: true })
        testOnOkCallback({ rounds: 11, moves: 3, isStrict: true })

        testOnOkCallback({ rounds: 4, moves: 1, isStrict: false })
        testOnOkCallback({ rounds: 6, moves: 3, isStrict: false })
        testOnOkCallback({ rounds: 9, moves: 7, isStrict: false })


        function testOnOkCallback({ rounds, moves, isStrict }) {
          it(`'onOk' is called once`, () => {
            const onOk = jest.fn()
            const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)
            gameSoFar.callbacks.onOk = onOk
            const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
            makeMove(rightMove, gameSoFar)
            expect(onOk).toHaveBeenCalledTimes(1)
          })
        }
      })


      describe(`new round triggers 'onOk' and 'onNewRound' callbacks`, () => {
        testCallbacks({ rounds: 5, moves: 5, isStrict: true })
        testCallbacks({ rounds: 9, moves: 9, isStrict: true })
        testCallbacks({ rounds: 11, moves: 11, isStrict: true })

        testCallbacks({ rounds: 4, moves: 4, isStrict: false })
        testCallbacks({ rounds: 6, moves: 6, isStrict: false })
        testCallbacks({ rounds: 9, moves: 9, isStrict: false })


        function testCallbacks({ rounds, moves, isStrict }) {
          const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)

          it(`'onOk' and 'onNewRound' are called once each`, () => {
            const onOk = jest.fn()
            const onNewRound = jest.fn()

            gameSoFar.callbacks.onOk = onOk
            gameSoFar.callbacks.onNewRound = onNewRound

            const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
            makeMove(rightMove, gameSoFar)

            expect(onOk).toHaveBeenCalledTimes(1)
            expect(onNewRound).toHaveBeenCalledTimes(1)
          })
        }
      })


      describe(`wrong move triggers 'onError' and 'onNewRound' callbacks`, () => {
        testCallbacks({ rounds: 4, moves: 3, isStrict: true })
        testCallbacks({ rounds: 5, moves: 5, isStrict: true })
        testCallbacks({ rounds: 11, moves: 1, isStrict: true })

        testCallbacks({ rounds: 15, moves: 9, isStrict: false })
        testCallbacks({ rounds: 13, moves: 1, isStrict: false })
        testCallbacks({ rounds: 18, moves: 17, isStrict: false })


        function testCallbacks({ rounds, moves, isStrict }) {
          const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)

          it(`'onError' and 'onNewRound' are called once each`, () => {
            const onError = jest.fn()
            const onNewRound = jest.fn()

            gameSoFar.callbacks.onError = onError
            gameSoFar.callbacks.onNewRound = onNewRound

            const wrongMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length] + 1
            makeMove(wrongMove, gameSoFar)

            expect(onError).toHaveBeenCalledTimes(1)
            expect(onNewRound).toHaveBeenCalledTimes(1)
          })
        }
      })


      describe(`win triggers 'onOk', 'onWin' and 'onNewRound' callbacks`, () => {
        testCallbacks({ rounds: 19, moves: 19, isStrict: true })
        testCallbacks({ rounds: 19, moves: 19, isStrict: false })


        function testCallbacks({ rounds, moves, isStrict }) {
          const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)

          it(`'onOk', 'onWin', 'onNewRound' are called once each`, () => {
            const onOk = jest.fn()
            const onWin = jest.fn()
            const onNewRound = jest.fn()

            gameSoFar.callbacks.onOk = onOk
            gameSoFar.callbacks.onWin = onWin
            gameSoFar.callbacks.onNewRound = onNewRound

            const move = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
            makeMove(move, gameSoFar)

            expect(onOk).toHaveBeenCalledTimes(1)
            expect(onWin).toHaveBeenCalledTimes(1)
            expect(onNewRound).toHaveBeenCalledTimes(1)
          })
        }
      })
    })


    describe(`then user finishes round correctly`, () => {

      for (n = 0; n < 20; n++)
        testRoundLength({ roundsPlayed: n, expectedLength: n + 1 })


      function testRoundLength({ roundsPlayed, expectedLength }) {
        it(`after ${roundsPlayed} rounds, game round length is ${expectedLength}`, () => {
          const gameSoFar = gameAfterRounds(roundsPlayed)

          expect(gameSoFar.expectedMoves).toHaveLength(expectedLength)
        })
      }
    })


    describe(`then user makes incorrect move`, () => {
      describe(`in normal mode`, () => {
        testIncorrectMove({ rounds: 6, moves: 2, isStrict: false })
        testIncorrectMove({ rounds: 12, moves: 10, isStrict: false })
        testIncorrectMove({ rounds: 5, moves: 4, isStrict: false })


        function testIncorrectMove({ rounds, moves, isStrict }) {
          it(`game resets madeMoves`, () => {
            const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)

            const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
            const gameAfterMove = flip(makeMove)(gameSoFar)

            expect(gameAfterMove(rightMove + 1).madeMoves).toEqual([])
          })
        }
      })


      describe(`in strict mode`, () => {
        testIncorrectMove({ rounds: 6, moves: 2, isStrict: true })
        testIncorrectMove({ rounds: 12, moves: 10, isStrict: true })
        testIncorrectMove({ rounds: 5, moves: 4, isStrict: true })


        function testIncorrectMove({ rounds, moves, isStrict }) {
          it(`game resets`, () => {
            const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)

            const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
            const gameAfterMove = flip(makeMove)(gameSoFar)

            expect(gameAfterMove(rightMove + 1).expectedMoves).toHaveLength(1)
            expect(gameAfterMove(rightMove + 1).madeMoves).toHaveLength(0)
          })
        }
      })
    })
  })
})


function gameAfterRoundsAndMoves(roundsCount, movesCount, isStrict) {
  return pipe(
    gameAfterRounds(roundsCount, isStrict),
    g => makeMoves(g.expectedMoves.slice(0, movesCount), g))
}


function gameAfterRounds(x, isStrict) {
  let game = newGameWithStubCallbacks(isStrict)
  for (i = 0; i < x; i++)
    game = makeMoves(game.expectedMoves, game)
  return game
}


function makeMoves(moves, g) {
  return moves.reduce(flip(makeMove), g)
}


function newGameWithStubCallbacks(isStrict) {
  return newGame(isStrict, stubCallbacks)
}
