// from https://yarnpkg.com/features/constraints

module.exports = {
  async constraints({ Yarn }) {
    // Expo SDK 56 ships React 19.2.3; react-dom must match it exactly on web
    for (const dep of Yarn.dependencies({ ident: 'react' })) {
      dep.update(`19.2.3`)
    }
    for (const dep of Yarn.dependencies({ ident: 'react-dom' })) {
      dep.update(`19.2.3`)
    }
  }
}
