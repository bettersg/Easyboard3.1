// from https://yarnpkg.com/features/constraints

module.exports = {
  async constraints({ Yarn }) {
    // Expo SDK 53 ships React 19.0.0; react-dom must match it exactly on web
    for (const dep of Yarn.dependencies({ ident: 'react' })) {
      dep.update(`19.0.0`)
    }
    for (const dep of Yarn.dependencies({ ident: 'react-dom' })) {
      dep.update(`19.0.0`)
    }
  }
}
