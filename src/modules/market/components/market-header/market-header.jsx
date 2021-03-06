import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'


import { ChevronLeft } from 'modules/common/components/icons'

import { CATEGORICAL, SCALAR } from 'modules/markets/constants/market-types'
import { BigNumber } from 'bignumber.js'
import Styles from 'modules/market/components/market-header/market-header.styles'
import CoreProperties from 'modules/market/components/core-properties/core-properties'

const OVERFLOW_DETAILS_LENGTH = 560

export default class MarketHeader extends Component {
  static propTypes = {
    clearSelectedOutcome: PropTypes.func,
    description: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    history: PropTypes.object.isRequired,
    maxPrice: PropTypes.instanceOf(BigNumber).isRequired,
    minPrice: PropTypes.instanceOf(BigNumber).isRequired,
    market: PropTypes.object.isRequired,
    currentTimestamp: PropTypes.number.isRequired,
    marketType: PropTypes.string,
    scalarDenomination: PropTypes.string,
    resolutionSource: PropTypes.any,
    selectedOutcome: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.state = {
      showReadMore: false,
    }

    this.toggleReadMore = this.toggleReadMore.bind(this)
  }

  toggleReadMore() {
    this.setState({ showReadMore: !this.state.showReadMore })
  }

  render() {
    const {
      clearSelectedOutcome,
      description,
      history,
      marketType,
      resolutionSource,
      selectedOutcome,
      minPrice,
      maxPrice,
      scalarDenomination,
      market,
      currentTimestamp,
    } = this.props

    let { details } = this.props

    const detailsTooLong = details.length > OVERFLOW_DETAILS_LENGTH

    if (marketType === SCALAR) {
      const denomination = scalarDenomination ? ' ' + scalarDenomination : ''
      const warningText = (details.length > 0 ? `\n\n` : ``) + `If the real-world outcome for this market is above this market's maximum value, the maximum value (${maxPrice.toNumber()}${denomination}) should be reported. If the real-world outcome for this market is below this market's minimum value, the minimum value (${minPrice.toNumber()}${denomination}) should be reported.`
      details += warningText
    }

    return (
      <section className={Styles.MarketHeader}>
        <div className={Styles.MarketHeader__nav}>
          {selectedOutcome !== null && marketType === CATEGORICAL ?
            <button
              className={Styles[`MarketHeader__back-button`]}
              onClick={() => clearSelectedOutcome()}
            >
              {ChevronLeft}<span> view all outcomes</span>
            </button> :
            <button
              className={Styles[`MarketHeader__back-button`]}
              onClick={() => history.goBack()}
            >
              {ChevronLeft}<span> back</span>
            </button>
          }
        </div>
        <div className={Styles[`MarketHeader__main-values`]}>
          <div className={Styles.MarketHeader__descContainer}>
            <h1 className={Styles.MarketHeader__description}>
              {description}
            </h1>
            <div className={Styles.MarketHeader__descriptionContainer} onClick={this.toggleReadMore} role="button" tabIndex="0">
              <div className={Styles.MarketHeader__details}>
                <h4>Resolution Source</h4>
                <span>{resolutionSource || 'General knowledge'}</span>
              </div>
              {details.length > 0 &&
                <div className={Styles.MarketHeader__details} style={{ marginTop: '20px' }}>
                  <h4>Additional Details</h4>
                  <label
                    className={classNames(
                      Styles['MarketHeader__AdditionalDetails-text'],
                      {
                        [Styles['MarketHeader__AdditionalDetails-tall']]: (detailsTooLong && this.state.showReadMore),
                      },
                    )}
                  >
                    {!this.state.showReadMore && detailsTooLong ? details.substring(0, OVERFLOW_DETAILS_LENGTH) + '...' : details}
                  </label>
                  { detailsTooLong && !this.state.showReadMore &&
                    <div className={Styles.MarketHeader__readMoreButton}>read more</div>
                  }
                </div>
              }
            </div>
          </div>
          <div
            className={classNames(
              Styles.MarketHeader__properties,
              {
                [Styles['MarketHeader__scalar-properties']]: (marketType === SCALAR),
              },
            )}
          >
            <CoreProperties market={market} currentTimestamp={currentTimestamp} />
          </div>
        </div>
      </section>
    )
  }
}
