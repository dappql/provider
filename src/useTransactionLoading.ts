import { useEffect, useState } from 'react'

import {
  TransactionStatus,
  useContractFunction,
  useNotifications,
} from '@usedapp/core'

export type TransactionType = ReturnType<typeof useContractFunction>

const LOADING_STATE = ['PendingSignature', 'Mining']

export function useTransactionLoading(state: TransactionStatus) {
  const [mining, setMining] = useState(false)
  const { notifications } = useNotifications()
  const preparing = LOADING_STATE.includes(state.status)

  useEffect(() => {
    const transactionNotifications = notifications.filter(
      (n) =>
        n.type !== 'walletConnected' &&
        n.type !== 'transactionPendingSignature' &&
        n.transaction.hash === state.transaction?.hash,
    )

    if (!mining) {
      setMining(
        !!transactionNotifications.find((n) => n.type === 'transactionStarted'),
      )
    } else {
      setMining(
        !transactionNotifications.find((n) => n.type !== 'transactionStarted'),
      )
    }
  }, [notifications, state.transaction?.hash])

  return preparing || mining
}
