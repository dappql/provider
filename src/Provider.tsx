import { ComponentType, createContext, useContext, useState } from 'react'

import DappQLCacheProvider, { CacheOptions } from '@dappql/cache'
import { QueryParams, useEthers, Config, DAppProvider } from '@usedapp/core'

export { useLookupAddress } from '@dappql/cache'

const Context = createContext<{
  queryParams?: QueryParams
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
  onMutationError,
  addressResolver,
  AddressResolverComponent,
}: {
  config: Config
  children: any
  queryParams?: QueryParams
  cacheOptions?: CacheOptions
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
