const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const jwks = require('jwks-rsa')

class Auth0TokenVerifier {

  constructor(options) {
    options = options || { }
    this.client = jwks({
      jwksUri: `https://${options.AUTH0_DOMAIN}/.well-known/jwks.json`,
      cache: !(options.cache === false),
      cacheMaxEntries: options.cacheMaxEntries || 5, // default value
      cacheMaxAge: options.cacheMaxAge || 10 * 60 * 60 * 1000, // 10 hr default value
    })
    this.client.getSigningKey = promisify(this.client.getSigningKey).bind(this.client)
  }

  decode(token) {
    try {
      let decoded = jwt.decode(token, { complete: true })
      if (!decoded) throw new Error()
      return decoded
    } catch (err) {
      throw new Error(`Invalid token format: ${token}`)
    }
  }

  async verify(token) {
    let decoded = this.decode(token)
    let kid = decoded.header.kid
    let key = await this.client.getSigningKey(kid)
    return await jwt.verify(token, key.publicKey)
  }
}

module.exports = Auth0TokenVerifier
