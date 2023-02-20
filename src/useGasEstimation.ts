import { useCallback } from 'react'

import {
  ChainId,
  TransactionOptions,
  useConfig,
  useEthers,
} from '@usedapp/core'
import { connectContractToSigner } from '@usedapp/core/dist/esm/src/hooks'
import {
  ContractFunctionNames,
  Falsy,
  Params,
  TypedContract,
} from '@usedapp/core/dist/esm/src/model'
import { useReadonlyNetworks } from '@usedapp/core/dist/esm/src/providers'
import { ethers, Contract, providers, BigNumber } from 'ethers'

type BaseProvider = providers.BaseProvider
type JsonRpcProvider = providers.JsonRpcProvider
type FallbackProvider = providers.FallbackProvider

export const getSignerFromOptions = (
  provider: BaseProvider,
  options?: TransactionOptions,
  library?: JsonRpcProvider | FallbackProvider,
) => {
  const privateKey = options && 'privateKey' in options && options.privateKey
  const mnemonicPhrase =
    options && 'mnemonicPhrase' in options && options.mnemonicPhrase
  const json = options && 'json' in options && options.json
  const password = options && 'password' in options && options.password

  const privateKeySigner =
    privateKey && provider && new ethers.Wallet(privateKey, provider)
  const mnemonicPhraseSigner =
    mnemonicPhrase &&
    provider &&
    ethers.Wallet.fromMnemonic(mnemonicPhrase).connect(provider)
  const encryptedJsonSigner =
    json &&
    password &&
    provider &&
    ethers.Wallet.fromEncryptedJsonSync(json, password).connect(provider)

  const optionsSigner = options && 'signer' in options && options.signer

  return (
    privateKeySigner ||
    mnemonicPhraseSigner ||
    encryptedJsonSigner ||
    optionsSigner ||
    (library && 'getSigner' in library ? library.getSigner() : undefined)
  )
}

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

export default function useGasEstimation<
  T extends TypedContract,
  FN extends ContractFunctionNames<T>,
>(contract: T | Falsy, functionName: FN, options?: TransactionOptions) {
  const { library, chainId } = useEthers()
  const transactionChainId =
    (options && 'chainId' in options && options?.chainId) || chainId

  const config = useConfig()
  const gasLimitBufferPercentage =
    options?.gasLimitBufferPercentage ??
    options?.bufferGasLimitPercentage ??
    config?.gasLimitBufferPercentage ??
    0

  const providers = useReadonlyNetworks()
  const provider = (transactionChainId &&
    providers[transactionChainId as ChainId])!

  const estimate = useCallback(
    async (...args: Params<T, FN>) => {
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

        return [...modifiedArgs, modifiedOpts]
      }
    },
    [
      contract,
      functionName,
      options,
      provider,
      library,
      gasLimitBufferPercentage,
    ],
  )

  return estimate
}
