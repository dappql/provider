import { ComponentType, createContext, useContext, useState } from 'react'

import DappQLCacheProvider, { CacheOptions } from '@dappql/cache'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { QueryParams, useEthers, Config, DAppProvider } from '@usedapp/core'
import {
  ContractFunctionNames,
  Params,
} from '@usedapp/core/dist/esm/src/model/types'
import { BaseContract } from 'ethers'

export { useLookupAddress } from '@dappql/cache'

type ContractCollection = Record<string, BaseContract>

type MutationInfo<
  Contracts extends ContractCollection,
  T extends keyof Contracts,
> = {
  contractAddress: string
  contractName: T
  methodName: ContractFunctionNames<Contracts[T]>
  optionsOrTransactionName?: string
  submissionId: number
}

export type MutationSubmitInfo<
  Contracts extends ContractCollection,
  T extends keyof Contracts,
> = MutationInfo<Contracts, T> & {
  args: Params<Contracts[T], ContractFunctionNames<Contracts[T]>>
}

export type MutationSuccessInfo<
  Contracts extends ContractCollection,
  T extends keyof Contracts,
> = MutationInfo<Contracts, T> & {
  receipt: TransactionReceipt
}

export type MutationErrorInfo<
  Contracts extends ContractCollection,
  T extends keyof Contracts,
> = MutationInfo<Contracts, T> & {
  error: Error
  receipt?: TransactionReceipt
}

export type MutationCallbacks = {
  onMutationSubmit?: <
    Contracts extends ContractCollection,
    T extends keyof Contracts,
  >(
    info: MutationSubmitInfo<Contracts, T>,
  ) => any
  onMutationSuccess?: <
    Contracts extends ContractCollection,
    T extends keyof Contracts,
  >(
    info: MutationSuccessInfo<Contracts, T>,
  ) => any
  onMutationError?: <
    Contracts extends ContractCollection,
    T extends keyof Contracts,
  >(
    info: MutationErrorInfo<Contracts, T>,
  ) => any
}

type ContextData = {
  queryParams?: QueryParams
  addressResolver?: (contractName: string, chainId?: number) => string
} & MutationCallbacks

const Context = createContext<ContextData>({})

export type AddressResolverFunction = (
  contractName: string,
  chainId?: number,
) => string | undefined

export type AddressResolverProps = {
  onResolved: (resolver: AddressResolverFunction) => any
}

export function DappQLProvider({
  config,
  queryParams = {},
  cacheOptions = {},
  children,
  addressResolver,
  AddressResolverComponent,
  onMutationSubmit,
  onMutationSuccess,
  onMutationError,
}: {
  config: Config
  children: any
  queryParams?: QueryParams
  cacheOptions?: CacheOptions
  addressResolver?: AddressResolverFunction
  AddressResolverComponent?: ComponentType<AddressResolverProps>
} & MutationCallbacks) {
  const [addressResolverState, setAddressResolver] = useState<{
    callback: AddressResolverFunction | undefined
  }>({ callback: addressResolver })
  return (
    <DappQLCacheProvider {...cacheOptions}>
      <DAppProvider config={config}>
        <Context.Provider
          value={{
            queryParams,
            onMutationSubmit,
            onMutationSuccess,
            onMutationError,
            addressResolver: addressResolverState.callback,
          }}>
          {AddressResolverComponent ? (
            <AddressResolverComponent
              onResolved={(callback) => {
                setAddressResolver({ callback })
              }}
            />
          ) : null}
          {!AddressResolverComponent || addressResolverState.callback
            ? children
            : null}
        </Context.Provider>
      </DAppProvider>
    </DappQLCacheProvider>
  )
}

export function useDappQL(queryParams: QueryParams & CacheOptions = {}) {
  const context = useContext(Context)
  const { chainId } = useEthers()

  return {
    ...context,
    queryParams: {
      ...context.queryParams,
      ...queryParams,
      chainId: queryParams.chainId || context.queryParams.chainId || chainId,
    },
  }
}
