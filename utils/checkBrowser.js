module.exports = function isBrowserRequest(req) {
    return req.get('User-Agent')?.includes('Mozilla');
  }
  