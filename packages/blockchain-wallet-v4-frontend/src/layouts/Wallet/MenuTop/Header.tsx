import React, { useCallback, useMemo } from 'react'
import { FormattedMessage } from 'react-intl'

import { Navbar } from 'components/Navbar'
import { selectors } from 'data'
import { Analytics, ModalName } from 'data/types'
import { useRemote } from 'hooks'

import { Props } from '.'

type OwnProps = Props & {
  history: { push: (path: string) => void }
}

const Header = (props: OwnProps) => {
  const { data } = useRemote(selectors.modules.profile.getCurrentTier)
  const isGoldVerified = useMemo(() => data === 2, [data])
  const refreshCallback = useCallback(() => {
    props.refreshActions.refreshClicked()
  }, [props.refreshActions])

  const logoutCallback = useCallback(() => {
    props.sessionActions.logout()
  }, [props.sessionActions])

  const sendCallback = useCallback(() => {
    props.modalActions.showModal(ModalName.SEND_CRYPTO_MODAL, { origin: 'Header' })
  }, [props.modalActions])

  const receiveCallback = useCallback(() => {
    props.modalActions.showModal(ModalName.REQUEST_CRYPTO_MODAL, { origin: 'FeaturesTopNav' })
  }, [props.modalActions])

  const fabCallback = useCallback(() => {
    props.modalActions.showModal(ModalName.TRADE_MODAL, {
      origin: 'Header'
    })
  }, [props.modalActions])

  const trackEventCallback = useCallback(
    (eventName) => {
      props.settingsActions.generalSettingsInternalRedirect(eventName)
    },
    [props.settingsActions]
  )

  const limitsCallback = useCallback(() => {
    props.modalActions.showModal(ModalName.TRADING_LIMITS_MODAL, {
      origin: 'Header'
    })
    trackEventCallback('TradingLimits')
  }, [props.modalActions, trackEventCallback])

  const referAFriendCallback = useCallback(() => {
    props.modalActions.showModal(ModalName.REFERRAL_LANDING_MODAL, {
      origin: 'Header'
    })
    trackEventCallback('Referral')
  }, [props.modalActions, trackEventCallback])

  const taxCenterCallback = useCallback(() => {
    props.history.push('/tax-center')

    props.analyticsActions.trackEvent({
      key: Analytics.TAX_CENTER_CLICKED,
      properties: {
        origin: 'SETTINGS'
      }
    })
  }, [props.analyticsActions, props.history])

  const primaryNavItems = [
    {
      dest: '/home',
      e2e: 'homeLink',
      text: <FormattedMessage id='copy.home' defaultMessage='Home' />
    },
    {
      dest: '/prices',
      e2e: 'pricesLink',
      text: <FormattedMessage id='copy.prices' defaultMessage='Prices' />
    },
    {
      dest: '/earn',
      e2e: 'earnLink',
      text: <FormattedMessage id='copy.earn' defaultMessage='Earn' />
    }
  ]

  if (props.invitations.nftBuySell) {
    primaryNavItems.push({
      dest: '/nfts/view',
      e2e: 'nftsLink',
      text: <FormattedMessage id='layouts.wallet.menuleft.navigation.nfts' defaultMessage='NFTs' />
    })
  }

  if (props.walletDebitCardEnabled) {
    primaryNavItems.push({
      dest: '/debit-card',
      e2e: 'debitCardLink',
      text: <FormattedMessage id='copy.card' defaultMessage='Card' />
    })
  }

  return (
    <Navbar
      primaryNavItems={primaryNavItems}
      fabClickHandler={fabCallback}
      isReferralAvailable={props.isReferralAvailable && isGoldVerified}
      isReferralRetrievalEnabled={props.featureFlags.isReferralRetrievalEnabled}
      limitsClickHandler={limitsCallback}
      referAFriendHandler={referAFriendCallback}
      logoutClickHandler={logoutCallback}
      nftsEnabled={props.nftsEnabled}
      receiveClickHandler={receiveCallback}
      refreshClickHandler={refreshCallback}
      sendClickHandler={sendCallback}
      taxCenterClickHandler={taxCenterCallback}
      trackEventCallback={trackEventCallback}
    />
  )
}

export default Header
