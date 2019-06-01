require('dotenv').config()
const { auth } = require('@funcmaticjs/auth0-username-password')
const Auth0TokenVerifier = require('../lib/verifier')

const EXPIRED_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9VUXdSRGhETXpZME5qTXhOa0ZHUWprelF6UXdOa0pETVRZMU0wUTBNa0pGUVRjNU5VSTFRZyJ9.eyJpc3MiOiJodHRwczovL2Z1bmNtYXRpYy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTM2MjAxNTk3NjUzNTcxNTY4NTciLCJhdWQiOlsiaHR0cHM6Ly9mdW5jbWF0aWMuYXV0aDAuY29tL2FwaS92Mi8iLCJodHRwczovL2Z1bmNtYXRpYy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNTI3NTQ0OTA3LCJleHAiOjE1Mjc1NTIxMDcsImF6cCI6IjlCa0NuMndreXcxZ2NqVGt3RjYzcVMyaU9qV001a2VUIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCJ9.PvuKP_c1Fpaor9UvwyOf6pgSkylST-wdYR7zau-tF7kt6Gtb0u4MEs9hTr6ydMDyjpHAkhc6Tdumq_vvEJkVcwtIWzycSTwdW8IfhKUWai1Dh3w7ZnVtPqxWesmK5ny8ytw36Km0Yt_aOpNeyUNQ3JACLe9UuVuY8wDA9mJXGZDOi2zBu03hBA0NssgOTpzfx1L1IHqi5H8leaIeQ2AgXWgVXIuK81k6UKHgqOLbqnVSpU7yllxystTKqL6NrpZ1Qn4Vkt33df2GrjHaeipOpep_LXxFG2DZ2nN6vcyjEQIsY_7QO7p9JIq-u_zRKnGhFHL65bJeQI0sNipPb5NpnQ"
const INVALID_CREDENTIALS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5FTXdNakF5TXpnME9EWXhSVEUzTWpOQ05qazNNek13UmpZMU9FUkdSamMyUkVFelFrUkJSUSJ9.eyJnaXZlbl9uYW1lIjoiRGFuaWVsIEpoaW4iLCJmYW1pbHlfbmFtZSI6IllvbyIsIm5pY2tuYW1lIjoiZGFuaWVsanlvbyIsIm5hbWUiOiJEYW5pZWwgSmhpbiBZb28iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1MVW0ydnlZY0xUYy9BQUFBQUFBQUFBSS9BQUFBQUFBQUFDTS9BZk02ZDVTTkU0US9waG90by5qcGciLCJnZW5kZXIiOiJtYWxlIiwibG9jYWxlIjoiZW4iLCJ1cGRhdGVkX2F0IjoiMjAxOC0xMi0xMFQwNDoyODo0NS43MTlaIiwiZW1haWwiOiJkYW5pZWxqeW9vQGdvYWxib29rYXBwLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL3N1cGVyc2hlZXRzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNzc2NDEzOTAwNDgyODczNzMyNiIsImF1ZCI6IlJrcFZldDlwem9yMmhaSjAxMkhoMXZwbnJBbFBxWm12IiwiaWF0IjoxNTQ0NDE4MDMxLCJleHAiOjE1NDQ0NTQwMzEsImF0X2hhc2giOiJsMXNFRC1JclBKbFdBNnhWMjNadVpRIiwibm9uY2UiOiJpSjd5UkN2VFZ2YkhLVnh1Wi1IVmUxMk9Kdmd2VjZhUCJ9.zPzNIR0DqvXDpqz7SYq0CwzYN2r6kIyc4J1Fn4DfGbKCluIj2wPuNo_oSDABgii5W7Pw4RI8eYgyq3Yga4urFNPjpS87Z9-4fQ0G00Q-2L4AtHihNqnyb0VjmzWkR1iKao3wYzOLTurrse1uwg4f8KTTDGsL5WRCdfiCd_GgK7kUuKiIRiRn7FfsvcS4eMidMt7wo2rBahBXvRAlwaOxWx6HN7J5TwlcAGkkJW2fc2nd3jXKpRk44l9ZDHQuhR-g63JPdJtSfScVP2JkvALTLW9lV_76lhHLPoR5B5DuVoyFurgePKVZLOropRcuc18BwsA99-gmaWbhfBPYBeO9ww"
const MALFORMED_TOKEN = "BADTOKEN"

describe('Token Verification', () => {
  let tokens = null
  let verifier = null
  beforeAll(async () => {
    tokens = await getAuth0Tokens()
  })  
  beforeEach(async () => {
    verifier = new Auth0TokenVerifier({ AUTH0_DOMAIN: process.env.AUTH0_DOMAIN })
  })  
  it ('should verify a valid id token', async () => {
    let decoded = await verifier.verify(tokens.id_token)
    expect(decoded).toMatchObject({
      name: process.env.AUTH0_USERNAME,
      iss: `https://${ process.env.AUTH0_DOMAIN}/`
    })
  })
  it ('should verify a valid access token', async () => {
    let decoded = await verifier.verify(tokens.access_token)
    expect(decoded).toMatchObject({
      // No user info in the access_token
      // name: process.env.AUTH0_USERNAME, 
      iss: `https://${ process.env.AUTH0_DOMAIN}/`
    })
  })
  it ('should throw on an expired token', async () => {
    let error = null
    try {
      await verifier.verify(EXPIRED_TOKEN)
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toEqual("jwt expired")
  })
  it ('should throw on token from different issuer', async () => {
    let error = null
    try {
      await verifier.verify(INVALID_CREDENTIALS_TOKEN)
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toEqual(expect.stringMatching(/^Unable to find a signing key that matches/))
  })
  it ('should throw on a malformed token', async () => {
    let error = null
    try {
      await verifier.verify(MALFORMED_TOKEN)
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toEqual(expect.stringMatching(/^Invalid token format/))
  })
  it ('should throw if setup with incorrect auth0 domain', async () => {
    let badverifier = new Auth0TokenVerifier({ AUTH0_DOMAIN: "baddomain.auth0.com" })
    let error = null
    try {
      await badverifier.verify(tokens.access_token)
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    expect(error.message).toEqual(expect.stringMatching(/^Not Found/))
  })
})

async function getAuth0Tokens() {
  let username = process.env.AUTH0_USERNAME
  let password = process.env.AUTH0_PASSWORD
  let user = await auth(username, password, {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENTID: process.env.AUTH0_CLIENTID,
    AUTH0_CLIENTSECRET: process.env.AUTH0_CLIENTSECRET,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    AUTH0_SCOPE: process.env.AUTH0_SCOPE
  })
  return user
}