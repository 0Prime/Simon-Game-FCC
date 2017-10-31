const { pass, fail } = require('./backend')


it('failing test', () =>
  expect(fail()).toBeTruthy())

it(`passing test`, () =>
  expect(pass()).toBeTruthy())
