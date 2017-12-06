const pipe = (x, f, ...fs) => f ? pipe(f(x), ...fs) : x


const compose = (...fs) =>
  fs.reduce((prevFn, nextFn) =>
    x => nextFn(prevFn(x)),
    x => x)


const curry = (f, ...args) => f.bind(undefined, ...args)


const autoCurry = f => (...args) =>
  args.length < f.length ?
  autoCurry(f.bind(undefined, ...args)) :
  f(...args)


const flip = autoCurry((f, a, b) => f(b, a))


const last = xs => xs[xs.length - 1]


const groupBy = (keyFn, xs) =>
  xs.reduce((acc, x, i) => {
    const key = keyFn(x, i)
    acc[key] = (acc[key] || []).concat(x)
    return acc
  }, {})


const splitBy = (predicate, xs) =>
  pipe(groupBy(predicate, xs), Object.values)


const intersection = autoCurry((xs, ys) => xs.filter(x => ys.includes(x)))


const sortPair = autoCurry((predicate, [x, y]) => predicate ? [x, y] : [y, x])


const isEven = x => x % 2 === 0
const isOdd = x => x % 2 !== 0


const equals = autoCurry((xs, ys) =>
  xs.length === ys.length && xs.every((x, i) => x === ys[i]))


const anyOf = xs => xs[Math.floor(Math.random() * xs.length)]


const repeat = autoCurry((f, n) => { for (i = 0; i < n; i++) f() })


module.exports = {
  pipe,
  flip,
  curry,
  autoCurry,
  last,
  groupBy,
  splitBy,
  intersection,
  sortPair,
  isEven,
  isOdd,
  equals,
  anyOf,
  repeat
}
