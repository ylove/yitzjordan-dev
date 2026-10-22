'use strict'

// No-op stand-in for find-node-modules. See package.json for why it exists.
// The real API returns a list of node_modules directories; an empty list is a safe answer.
module.exports = function findNodeModules() {
  return []
}
