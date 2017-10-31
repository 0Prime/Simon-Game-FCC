const { last, flip, intersection, pipe } = require('./tools')
const { newGame, makeMove } = require('./backend')


describe(`simon game`, () => {
  it(`user can start new game`, () =>
    expect(newGame()).toBeDefined())


  it(`new game is expecting 1 press`, () =>
    expect(newGame().expectedMoves).toHaveLength(1))


  it(`user can input moves into game`, () =>
    expect(makeMove).toBeDefined())


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


  it(`new game is not over`, () =>
    expect(newGame().isOver).toBe(false))


  describe(`function makeMove`, () => {
    describe(`then user finishes round correctly`, () => {

      for (round = 0; round < 20; round++)
        testRoundLengthAfterRound(round, round + 1)

      it(`after 20 rounds game is over`, () =>
        expect(gameAfterRounds(20).isOver).toBe(true))
    })


    describe(`then user makes incorrect move`, () => {
      describe(`in normal mode`, () => {
        it(`game does not increase expected moves`, () => {
          const game0 = newGame()

          const game1 = makeMove(game0.expectedMoves[0] + 1, game0)

          expect(game1.expectedMoves).toHaveLength(game0.expectedMoves.length)
        })
      })


      describe(`in strict mode`, () => {

        it(`game resets`, () => {
          const gameSoFar = gameAfterRoundsAndMoves(6, 2, true)

          const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
          const gameAfterMove = flip(makeMove)(gameSoFar)

          expect(gameAfterMove(rightMove + 1).expectedMoves).toHaveLength(1)
          expect(gameAfterMove(rightMove + 1).madeMoves).toHaveLength(0)
        })


        it(`game resets`, () => {
          const gameSoFar = gameAfterRoundsAndMoves(12, 10, true)

          const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
          const gameAfterMove = flip(makeMove)(gameSoFar)

          expect(gameAfterMove(rightMove + 1).expectedMoves).toHaveLength(1)
          expect(gameAfterMove(rightMove + 1).madeMoves).toHaveLength(0)
        })


        it(`game resets`, () => {
          const gameSoFar = gameAfterRoundsAndMoves(5, 4, true)

          const rightMove = gameSoFar.expectedMoves[gameSoFar.madeMoves.length]
          const gameAfterMove = flip(makeMove)(gameSoFar)

          expect(gameAfterMove(rightMove + 1).expectedMoves).toHaveLength(1)
          expect(gameAfterMove(rightMove + 1).madeMoves).toHaveLength(0)
        })
      })
    })
  })
})


function testRoundLengthAfterRound(roundsPlayed, expectedRoundLength) {
  it(`after ${roundsPlayed} rounds, game round length is ${expectedRoundLength}`, () => {
    const gameSoFar = gameAfterRounds(roundsPlayed)

    expect(gameSoFar.expectedMoves).toHaveLength(expectedRoundLength)
  })
}


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
