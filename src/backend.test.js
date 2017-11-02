const { last, flip, intersection, pipe } = require('./tools')
const { newGame, makeMove } = require('./backend')


describe(`simon game`, () => {
  it(`new game status is 'new round'`, () =>
    expect(newGame().status).toBe('new round'))


  it(`has expected moves only of four types`, () => {
    /**
     * In highly unlikely situation when random generator
     * fails to generate at least one of each 4 possible moves in 1000 iterations
     * this test will fail
     */
    const generatedMoves = []
    while (generatedMoves.length < 1000)
      generatedMoves.push(newGame().expectedMoves[0])

    const allowedMoves = [0, 1, 2, 3]
    const result = intersection(allowedMoves, generatedMoves)

    const wrongMoves = generatedMoves.filter(m => !allowedMoves.includes(m))

    expect(wrongMoves).toHaveLength(0)
    expect(result).toHaveLength(allowedMoves.length)
  })


  describe(`function makeMove`, () => {
    describe(`then user finishes round correctly`, () => {

      for (n = 0; n < 20; n++)
        testRoundLength({ roundsPlayed: n, expectedLength: n + 1 })


      function testRoundLength({ roundsPlayed, expectedLength }) {
        it(`after ${roundsPlayed} rounds, game round length is ${expectedLength}`, () => {
          const gameSoFar = gameAfterRounds(roundsPlayed)

          expect(gameSoFar.expectedMoves).toHaveLength(expectedLength)
        })
      }


      it(`after 20 rounds game status is 'win'`, () =>
        expect(gameAfterRounds(20).status).toBe('win'))


      describe(`game status is new round`, () => {
        for (n = 0; n < 20; n++)
          testStatusAfterRounds(n)
      })


      function testStatusAfterRounds(roundsPlayed) {
        it(`after ${roundsPlayed} rounds, game status is 'new round'`, () => {
          const gameSoFar = gameAfterRounds(roundsPlayed)

          expect(gameSoFar.status).toBe('new round')
        })
      }
    })


    describe(`then user makes incorrect move`, () => {
      describe(`in normal mode`, () => {
        testIncorrectMove({ rounds: 6, moves: 2, isStrict: false })
        testIncorrectMove({ rounds: 12, moves: 10, isStrict: false })
        testIncorrectMove({ rounds: 5, moves: 4, isStrict: false })

        testIncorrectMoveStatus({ rounds: 6, moves: 2, isStrict: false })
        testIncorrectMoveStatus({ rounds: 12, moves: 10, isStrict: false })
        testIncorrectMoveStatus({ rounds: 5, moves: 4, isStrict: false })


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

        testIncorrectMoveStatus({ rounds: 6, moves: 2, isStrict: true })
        testIncorrectMoveStatus({ rounds: 12, moves: 10, isStrict: true })
        testIncorrectMoveStatus({ rounds: 5, moves: 4, isStrict: true })


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


      function testIncorrectMoveStatus({ rounds, moves, isStrict }) {
        it(`game status is 'new round'`, () => {
          const gameSoFar = gameAfterRoundsAndMoves(rounds, moves, isStrict)

          const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
          const gameAfterMove = flip(makeMove)(gameSoFar)

          expect(gameAfterMove(rightMove + 1).status).toBe('new round')
        })
      }
    })
  })
})


function gameAfterRoundsAndMoves(roundsCount, movesCount, isStrict) {
  return pipe(
    gameAfterRounds(roundsCount, isStrict),
    g => makeMoves(g.expectedMoves.slice(0, movesCount), g))
}


function gameAfterRounds(x, isStrict) {
  let game = newGame(isStrict)
  for (i = 0; i < x; i++)
    game = makeMoves(game.expectedMoves, game)
  return game
}


function makeMoves(moves, g) {
  return moves.reduce(flip(makeMove), g)
}
