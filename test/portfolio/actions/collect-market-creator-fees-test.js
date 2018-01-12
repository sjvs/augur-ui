import { describe, it } from 'mocha'
import { assert } from 'chai'
import speedomatic from 'speedomatic'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

describe('modules/portfolio/actions/collect-market-creator-fees.js', () => {
  const middlewares = [thunk]
  const mockStore = configureMockStore(middlewares)

  const test = t => it(t.description, () => {
    const store = mockStore(t.state || {})

    t.assertions(store)
  })

  describe('collectMarketCreatorFees', () => {
    const { collectMarketCreatorFees, __RewireAPI__ } = require('modules/portfolio/actions/collect-market-creator-fees.js')

    const ACTIONS = {
      UPDATE_MARKETS_DATA: 'UPDATE_MARKETS_DATA'
    }
    const MailboxAddresses = ['0xmailbox01', '0xmailbox02']
    const MarketIds = ['0xmyMarket01', '0xmyMarket02']

    __RewireAPI__.__Rewire__('augur', {
      api: {
        Cash: {
          getBalance: (params, cb) => {
            assert.oneOf(params._address, MailboxAddresses, `Didn't get the expected params`)
            assert.isFunction(cb, `Callback provided isn't a function as expected`)
            if (params._address === MailboxAddresses[0]) {
              cb(null, speedomatic.fix(20, 'string'))
            } else {
              cb(null, 0)
            }
          }
        },
        Market: {
          getMarketCreatorMailbox: (params, cb) => {
            assert.oneOf(params.tx.to, MarketIds, `Didn't get the expected params`)
            assert.isFunction(cb, `Callback provided isn't a function as expected`)
            if (params.tx.to === MarketIds[0]) {
              cb(null, MailboxAddresses[0])
            } else {
              cb(null, MailboxAddresses[1])
            }
          }
        },
        Mailbox: {
          withdrawEther: (params, cb) => {
            // this should only ever get called by that first Market Mailbox, and not the second.
            assert.deepEqual(params, { tx: { to: MailboxAddresses[0] } }, `Attempted to call withdrawEther with unexpected params`)
            assert.isFunction(cb, `callback provided to withdrawEther isn't a function.`)
          }
        }
      },
      rpc: {
        eth: {
          getBalance: (params, cb) => {
            assert.oneOf(params[0], MailboxAddresses, `Didn't receive the expected params to augur.rpc.eth.balance`)
            assert.isFunction(cb, `Callback provided isn't a function`)
            // allows to test against mailboxes with currency and without.
            if (params[0] === MailboxAddresses[0]) {
              cb(speedomatic.fix(10.5, 'string'))
            } else {
              cb(0)
            }
          }
        }
      }
    })
    __RewireAPI__.__Rewire__('loadMarketsInfo', marketIds => ({
      type: ACTIONS.UPDATE_MARKETS_DATA,
      data: {
        marketIds
      }
    }))

    test({
      description: `Should fire a withdrawEther and updateMarketsData if we have ETH to collect from a market.`,
      assertions: (store) => {
        store.dispatch(collectMarketCreatorFees(MarketIds[0], (err, amountOfEthToBeCollected) => {
          assert.isNull(err, `Didn't return null for error as expected`)
          assert.deepEqual(amountOfEthToBeCollected, '30.5', `Expected the amount of ETH to be collected from market to be '30.5'`)
        }))

        const actual = store.getActions()

        const expected = [{
          type: ACTIONS.UPDATE_MARKETS_DATA,
          data: {
            marketIds: [MarketIds[0]]
          }
        }]

        assert.deepEqual(actual, expected, `Dispatched unexpected actions.`)
      }
    })

    test({
      description: `Shouldn't fire a withdrawEther or updateMarketsData if we have 0 ETH to collect from a market.`,
      assertions: (store) => {
        store.dispatch(collectMarketCreatorFees(MarketIds[1], (err, amountOfEthToBeCollected) => {
          assert.isNull(err, `Didn't return null for error as expected`)
          assert.deepEqual(amountOfEthToBeCollected, '0', `Expected the amount of ETH to be collected from market to be '0'`)
        }))

        const actual = store.getActions()

        const expected = []

        assert.deepEqual(actual, expected, `Dispatched unexpected actions.`)
      }
    })
  })
})