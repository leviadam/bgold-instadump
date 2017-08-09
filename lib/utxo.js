const KeyRing  = require('bcoin/lib/primitives/keyring')
    , Address  = require('bcoin/lib/primitives/address')
    , Electrum = require('./electrum')

const loadUtxo = (addrOrKey, {  electrum, proxy }) =>
  Electrum(electrum, proxy).listunspent(toAddr(addrOrKey))
    .then(utxos => utxos.map(u => ({ hash: u.tx_hash, vout: u.tx_pos, value: u.value })))

const keysUtxo = (keys, opt) =>
  Promise.all(keys.map(key =>
    loadUtxo(key, opt).then(xs =>
      xs.map(x => Object.assign({}, x, { key })))
  )).then(keysOut => [].concat(...keysOut))

const toAddr = str => {
  try { return KeyRing.fromSecret(str).getAddress().toString() } catch (_) {}
  try { return Address.fromString(str).toString() }              catch (_) {}
  throw new Error(`invalid addressOrKey: ${ str }`)
}

module.exports = loadUtxo
loadUtxo.loadUtxo = loadUtxo
loadUtxo.keysUtxo = keysUtxo