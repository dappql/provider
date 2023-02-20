import { useCallback, useState } from 'react'

import { TransactionReceipt } from '@ethersproject/abstract-provider'
import {
  ChainId,
  TransactionOptions,
  useConfig,
  useEthers,
} from '@usedapp/core'
import { getSignerFromOptions } from '@usedapp/core/dist/esm/src/helpers/getSignerFromOptions'
import { connectContractToSigner } from '@usedapp/core/dist/esm/src/hooks/useContractFunction'
import { usePromiseTransaction } from '@usedapp/core/dist/esm/src/hooks/usePromiseTransaction'
import {
  ContractFunctionNames,
  Falsy,
  Params,
  TypedContract,
} from '@usedapp/core/dist/esm/src/model'
import { useReadonlyNetworks } from '@usedapp/core/dist/esm/src/providers'
import { Contract, providers, BigNumber } from 'ethers'
import { LogDescription } from 'ethers/lib/utils'

export async function estimateContractFunctionGasLimit(
  contractWithSigner: Contract,
  functionName: string,
  args: any[],
  gasLimitBufferPercentage: number,
): Promise<BigNumber | undefined> {
  const estimatedGas = await contractWithSigner.estimateGas[functionName](
    ...args,
  )
  const gasLimit = estimatedGas?.mul(gasLimitBufferPercentage + 100).div(100)
  return gasLimit
}

export default function useContractFunction<
  T extends TypedContract,
  FN extends ContractFunctionNames<T>,
>(contract: T | Falsy, functionName: FN, options?: TransactionOptions) {
  const { library, chainId } = useEthers()
  const transactionChainId =
    (options && 'chainId' in options && options?.chainId) || chainId
  const { promiseTransaction, state, resetState } = usePromiseTransaction(
    transactionChainId,
    options,
  )
  const [events, setEvents] = useState<LogDescription[] | undefined>(undefined)

  const config = useConfig()
  const gasLimitBufferPercentage =
    options?.gasLimitBufferPercentage ??
    options?.bufferGasLimitPercentage ??
    config?.gasLimitBufferPercentage ??
    0

  const providers = useReadonlyNetworks()
  const provider = (transactionChainId &&
    providers[transactionChainId as ChainId])!

  const send = useCallback(
    async (...args: Params<T, FN>): Promise<TransactionReceipt | undefined> => {
      if (contract) {
        const numberOfArgs =
          contract.interface.getFunction(functionName).inputs.length
        const hasOpts = args.length > numberOfArgs
        if (args.length !== numberOfArgs && args.length !== numberOfArgs + 1) {
          throw new Error(
            `Invalid number of arguments for function "${functionName}".`,
          )
        }

        const signer = getSignerFromOptions(
          provider as providers.BaseProvider,
          options,
          library,
        )

        const contractWithSigner = connectContractToSigner(
          contract,
          options,
          signer,
        )
        const opts = hasOpts ? args[args.length - 1] : undefined

        const gasLimit =
          typeof opts === 'object' &&
          Object.prototype.hasOwnProperty.call(opts, 'gasLimit')
            ? opts.gasLimit
            : (await estimateContractFunctionGasLimit(
                contractWithSigner,
                functionName,
                args,
                gasLimitBufferPercentage,
              )) ?? null

        const modifiedOpts = {
          gasLimit,
          ...opts,
        }
        const modifiedArgs = hasOpts ? args.slice(0, args.length - 1) : args

        const receipt = await promiseTransaction(
          contractWithSigner[functionName](...modifiedArgs, modifiedOpts),
          {
            safeTransaction: {
              to: contract.address,
              value: opts?.value,
              data: contract.interface.encodeFunctionData(
                functionName,
                modifiedArgs,
              ),
              safeTxGas: gasLimit ?? undefined,
            },
          },
        )
        if (receipt?.logs) {
          const events = receipt.logs.reduce((accumulatedLogs, log) => {
            try {
              return log.address.toLowerCase() ===
                contract.address.toLowerCase()
                ? [...accumulatedLogs, contract.interface.parseLog(log)]
                : accumulatedLogs
            } catch {
              return accumulatedLogs
            }
          }, [] as LogDescription[])
          setEvents(events)
        }
        return receipt
      }
    },
    [
      contract,
      functionName,
      options,
      provider,
      library,
      gasLimitBufferPercentage,
      promiseTransaction,
    ],
  )

  return { send, state, events, resetState }
}
