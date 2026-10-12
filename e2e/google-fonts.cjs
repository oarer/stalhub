module.exports = new Proxy({}, {
  get: (_target, url) => typeof url === 'string'
    ? '@font-face { font-family: "Roboto"; src: local("Arial"); font-weight: 100 900; font-style: normal; }'
    : undefined,
})
