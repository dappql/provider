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

export type ContractCollection = Record<string, BaseContract>

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
    onMutationSubmit,
    onMutationSuccess,
    onMutationError,
  } = useDappQL()

  const { chainId: providerChainId } = useEthers()

  const contractAddress = useMemo(
    () => addressResolver?.(contractName.toString(), chainId),
    [contractName, chainId, addressResolver],
  )

  const contract = useMemo(
    () => getContract(contractName, chainId, contractAddress),
    [getContract, contractName, chainId, contractAddress],
  )

  const [submitting, setSubmitting] = useState(false)
  const [submissionId, setSubmissionId] = useState(0)

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

  const mutationInfo = {
    contractAddress,
    contractName,
    methodName,
    transactionName: options?.transactionName || '',
  }

  const send = useCallback(
    async (
      ...args: Params<Contracts[T], typeof methodName>
    ): Promise<TransactionReceipt | undefined> => {
      setSubmitting(true)

      const newSubmissionId = Date.now()
      setSubmissionId(newSubmissionId)
      onMutationSubmit({
        ...mutationInfo,
        submissionId: newSubmissionId,
        args,
      })

      if (!providerChainId) {
        onMutationError({
          ...mutationInfo,
          submissionId: 0,
          error: new Error('Invalid Chain'),
        })
        return
      }

      const receipt = await transaction.send(...args)
      return receipt
    },
    [transaction.send, chainId, providerChainId, contract],
  )

  useEffect(() => {
    if (transaction.state.status === 'Exception') {
      onMutationError({
        ...mutationInfo,
        submissionId,
        receipt: transaction.state.receipt,
        error: new Error(transaction.state.errorMessage),
      })
    } else if (transaction.state.status === 'Success') {
      onMutationSuccess({
        ...mutationInfo,
        submissionId,
        receipt: transaction.state.receipt,
      })
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
