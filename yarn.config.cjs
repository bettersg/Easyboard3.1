// from https://yarnpkg.com/features/constraints

module.exports = {
  async constraints({ Yarn }) {
    for (const dep of Yarn.dependencies({ ident: 'next' })) {
      dep.update(`^14.2.23`)
    }
    for (const dep of Yarn.dependencies({ ident: 'react' })) {
      dep.update(`18.3.1`)
    }
    for (const dep of Yarn.dependencies({ ident: 'react-dom' })) {
      dep.update(`18.3.1`)
    }
    for (const dep of Yarn.dependencies({ ident: 'solito' })) {
      dep.update(`^5.0.0`)
    }
  }
}
