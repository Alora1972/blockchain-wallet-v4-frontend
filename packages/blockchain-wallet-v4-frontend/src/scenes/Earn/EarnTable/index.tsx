import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { RemoteDataType, RewardsRatesType } from '@core/types'
import { actions } from 'data'
import { Analytics } from 'data/types'
import { useRemote } from 'hooks'
import { useMedia } from 'services/styles'

import { SuccessStateType as ParentSuccessStateType } from '..'
import Loading from '../Earn.loading.template'
import MobileRow from './MobileRow'
import { getData } from './selectors'
import SortableTable from './SortableTable'

const EarnTableContainer = (props: Props) => {
  const { analyticsActions, earnActions, sortedInstruments } = props
  const { data, error, isLoading, isNotAsked } = useRemote(getData)
  const isTabletL = useMedia('tabletL')

  if (error) return null
  if (isLoading || isNotAsked || !data) return <Loading />

  const handleClick = (coin, isStaking) => {
    const {
      WALLET_REWARDS_DETAIL_CLICKED,
      WALLET_STAKING_DETAIL_CLICKED,
      WALLET_STAKING_WARNING_CONTINUE_CLICKED
    } = Analytics
    const balance = data?.stakingAccountBalance[coin]?.balance
    const hasBalance = balance && Number(balance) > 0
    analyticsActions.trackEvent({
      key: isStaking
        ? hasBalance
          ? WALLET_STAKING_DETAIL_CLICKED
          : WALLET_STAKING_WARNING_CONTINUE_CLICKED
        : WALLET_REWARDS_DETAIL_CLICKED,
      properties: {
        currency: coin
      }
    })

    if (isStaking) {
      if (hasBalance) {
        earnActions.showStakingModal({ coin, step: 'ACCOUNT_SUMMARY' })
      } else {
        earnActions.showStakingModal({ coin, step: 'WARNING' })
      }
    } else {
      earnActions.showInterestModal({ coin, step: 'ACCOUNT_SUMMARY' })
    }
  }

  return isTabletL ? (
    <>
      {sortedInstruments.map(({ coin, product }) => {
        return window.coins[coin] ? (
          <MobileRow
            {...data}
            {...props}
            coin={coin}
            handleClick={handleClick}
            product={product}
            key={coin}
          />
        ) : null
      })}
    </>
  ) : (
    <SortableTable {...data} {...props} handleClick={handleClick} />
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  analyticsActions: bindActionCreators(actions.analytics, dispatch),
  earnActions: bindActionCreators(actions.components.interest, dispatch),
  profileActions: bindActionCreators(actions.modules.profile, dispatch)
})

const connector = connect(null, mapDispatchToProps)

export type OwnPropsType = {
  interestRates: RewardsRatesType
  isGoldTier: boolean
}

export type SuccessStateType = ReturnType<typeof getData>['data']

export type LinkStatePropsType = {
  data: RemoteDataType<string, SuccessStateType>
}

export type Props = OwnPropsType & ParentSuccessStateType & ConnectedProps<typeof connector>

export default connector(EarnTableContainer)
