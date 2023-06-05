import { ComponentType, createContext, useContext, useState } from 'react'

import DappQLCacheProvider, { CacheOptions } from '@dappql/cache'
import { QueryParams, useEthers, Config, DAppProvider } from '@usedapp/core'
import {
  ContractFunctionNames,
  Params,
} from '@usedapp/core/dist/esm/src/model/types'
import { BaseContract } from 'ethers'

export { useLookupAddress } from '@dappql/cache'

type ContractCollection = Record<string, BaseContract>

const Context = createContext<{
  queryParams?: QueryParams
  onMutationSubmit?: <
    Contracts extends ContractCollection,
    T extends keyof Contracts,
  >(
    contractAddress: string,
    contractName: T,
    methodName: ContractFunctionNames<Contracts[T]>,
    transactionName: string,
    ...args: Params<Contracts[T], ContractFunctionNames<Contracts[T]>>
  ) => any
  onMutationSuccess?: () => any
  onMutationError?: (error: Error) => any
  addressResolver?: (contractName: string, chainId?: number) => string
}>({})

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
  onMutationSubmit,
  onMutationSuccess,
  onMutationError,
  addressResolver,
  AddressResolverComponent,
}: {
  config: Config
  children: any
  queryParams?: QueryParams
  cacheOptions?: CacheOptions
  onMutationSubmit?: <
    Contracts extends ContractCollection,
    T extends keyof Contracts,
  >(
    contractAddress: string,
    contractName: T,
    methodName: ContractFunctionNames<Contracts[T]>,
    transactionName: string,
    ...args: Params<Contracts[T], ContractFunctionNames<Contracts[T]>>
  ) => any
  onMutationSuccess?: () => any
  onMutationError?: (error: Error) => any
  addressResolver?: AddressResolverFunction
  AddressResolverComponent?: ComponentType<AddressResolverProps>
}) {
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
