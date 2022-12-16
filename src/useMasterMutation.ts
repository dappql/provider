import { useCallback, useEffect, useMemo, useState } from 'react'

import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { useContractFunction } from '@usedapp/core'
import { ContractFunctionNames, Params } from '@usedapp/core/dist/esm/src/model'
import { BaseContract } from 'ethers'

import { useDappQL } from './provider'
import { useTransactionLoading } from './useTransactionLoading'

type ContractCollection = Record<string, BaseContract>

export function useMasterMutation<
  Contracts extends ContractCollection,
  T extends keyof Contracts,
>(
  getContract: (contract: T, network?: number) => Contracts[T],
  contractName: T,
  methodName: ContractFunctionNames<Contracts[T]>,
  transactionName?: string,
) {
  const {
    queryParams: { chainId },
    onMutationError,
  } = useDappQL()
  const contract = useMemo(
    () => getContract(contractName, chainId),
    [contractName, chainId],
  )
  const [submitting, setSubmitting] = useState(false)

  const transaction = useContractFunction(contract, methodName, {
    transactionName: transactionName || methodName,
  })
  const isLoading = useTransactionLoading(transaction.state) || submitting

  const send = useCallback(
    async (
      ...args: Params<Contracts[T], typeof methodName>
    ): Promise<TransactionReceipt | undefined> => {
      setSubmitting(true)
      return transaction.send(...args)
    },
    [transaction.send, chainId],
  )

  useEffect(() => {
    if (transaction.state.status === 'Exception') {
      onMutationError(new Error(transaction.state.errorMessage))
    }
    if (['Exception', 'Fail', 'Success'].includes(transaction.state.status)) {
      setSubmitting(false)
    }
  }, [transaction.state.status])

  useEffect(() => {
    if (!isLoading) {
      transaction.resetState()
    }
  }, [isLoading])

  return {
    ...transaction,
    send,
    isLoading,
  }
}

export type Mutation = ReturnType<typeof useMasterMutation>
