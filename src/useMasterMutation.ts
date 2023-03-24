import { useCallback, useEffect, useMemo, useState } from 'react'

import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { useContractFunction, useEthers } from '@usedapp/core'
import {
  ContractFunctionNames,
  Params,
  TransactionOptions,
} from '@usedapp/core/dist/esm/src/model'
import { BaseContract } from 'ethers'

import { useDappQL } from './provider'
import { useTransactionLoading } from './useTransactionLoading'

type ContractCollection = Record<string, BaseContract>

export function useMasterMutation<
  Contracts extends ContractCollection,
  T extends keyof Contracts,
>(
  getContract: (contract: T, network: number, address?: string) => Contracts[T],
  contractName: T,
  methodName: ContractFunctionNames<Contracts[T]>,
  optionsOrTransactionName?: TransactionOptions | string,
) {
  const {
    queryParams: { chainId },
    addressResolver,
    onMutationError,
  } = useDappQL()

  const { chainId: providerChainId } = useEthers()

  const contract = useMemo(
    () =>
      getContract(
        contractName,
        chainId,
        addressResolver?.(contractName.toString(), chainId),
      ),
    [getContract, contractName, chainId, addressResolver],
  )

  const [submitting, setSubmitting] = useState(false)

  const options = useMemo(
    () =>
      typeof optionsOrTransactionName === 'string'
        ? { transactionName: optionsOrTransactionName }
        : optionsOrTransactionName,
    [optionsOrTransactionName],
  )

  const transaction = useContractFunction(contract, methodName, {
    transactionName: options?.transactionName || methodName,
  })
  const isLoading = useTransactionLoading(transaction.state) || submitting

  const send = useCallback(
    async (
      ...args: Params<Contracts[T], typeof methodName>
    ): Promise<TransactionReceipt | undefined> => {
      if (!providerChainId) {
        onMutationError(new Error('Invalid Chain'))
        return
      }

      setSubmitting(true)
      return transaction.send(...args)
    },
    [transaction.send, chainId, providerChainId, contract],
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

export type MasterMutation = ReturnType<typeof useMasterMutation>
