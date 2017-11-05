const { autoCurry, last, flip, intersection, pipe, repeat } = require('./tools')
const { newGame, makeMove } = require('./backend')


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
        const tester = testCallbacks(['onOk'], rightMove)

        const testStrict = tester(true)
        testStrict({ rounds: 5, moves: 2 })
        testStrict({ rounds: 9, moves: 6 })
        testStrict({ rounds: 11, moves: 3 })

        const testUnstrict = tester(false)
        testUnstrict({ rounds: 4, moves: 1 })
        testUnstrict({ rounds: 6, moves: 3 })
        testUnstrict({ rounds: 9, moves: 7 })
      })


      describe(`new round triggers 'onOk' and 'onNewRound' callbacks`, () => {
        const tester = testCallbacks(['onOk', 'onNewRound'], rightMove)

        const testStrict = tester(true)
        testStrict({ rounds: 5, moves: 5 })
        testStrict({ rounds: 9, moves: 9 })
        testStrict({ rounds: 11, moves: 11 })

        const testUnstrict = tester(false)
        testUnstrict({ rounds: 4, moves: 4 })
        testUnstrict({ rounds: 6, moves: 6 })
        testUnstrict({ rounds: 9, moves: 9 })
      })


      describe(`wrong move triggers 'onError' and 'onNewRound' callbacks`, () => {
        const tester = testCallbacks(['onError', 'onNewRound'], wrongMove)

        const testStrict = tester(true)
        testStrict({ rounds: 4, moves: 3 })
        testStrict({ rounds: 5, moves: 5 })
        testStrict({ rounds: 11, moves: 1 })

        const testUnstrict = tester(false)
        testUnstrict({ rounds: 15, moves: 9 })
        testUnstrict({ rounds: 13, moves: 1 })
        testUnstrict({ rounds: 18, moves: 17 })
      })


      describe(`win triggers 'onOk', 'onWin' and 'onNewRound' callbacks`, () => {
        const tester = testCallbacks(['onOk', 'onWin', 'onNewRound'], rightMove)

        tester(true, { rounds: 19, moves: 19 })
        tester(false, { rounds: 19, moves: 19 })
      })


      function testCallbacks() {
        return autoCurry((callbackNames, moveFn, isStrict, { rounds, moves }) =>
          it(`${callbackNames} functions are called once each`, () => {
            const mocks = callbackNames.map(n => [n, jest.fn()])

            const gameSoFar = pipe(
              gameAfterRoundsAndMoves(rounds, moves, isStrict),
              game => mocks.reduce((g, [n, m]) => {
                g.callbacks[n] = m
                return g
              }, game))

            const move = moveFn(gameSoFar)
            makeMove(move, gameSoFar)

            mocks.forEach(([n, m]) =>
              expect(m).toHaveBeenCalledTimes(1))
          }))
      }

      function rightMove(g) { return g.expectedMoves[g.madeMoves.length] }

      function wrongMove(g) { return rightMove(g) + 1 }
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
  const doNothing = () => {}
  return newGame(isStrict, {
    onError: doNothing,
    onNewRound: doNothing,
    onOk: doNothing,
    onWin: doNothing
  })
}
