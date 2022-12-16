import { createContext, useContext } from 'react'

import DappQLCacheProvider, { CacheOptions } from '@dappql/cache'
import { QueryParams, useEthers, Config, DAppProvider } from '@usedapp/core'

export { useLookupAddress } from '@dappql/cache'

const Context = createContext<{
  queryParams?: QueryParams
  onMutationError?: (error: Error) => any
  addressResolver?: (contractName: string, chainId?: number) => string
}>({})

export function DappQLProvider({
  config,
  queryParams = {},
  cacheOptions = {},
  children,
  onMutationError,
  addressResolver,
}: {
  config: Config
  children: any
  queryParams?: QueryParams
  cacheOptions?: CacheOptions
  onMutationError?: (error: Error) => any
  addressResolver?: (contractName: string, chainId?: number) => string
}) {
  return (
    <DAppProvider config={config}>
      <Context.Provider
        value={{ queryParams, onMutationError, addressResolver }}>
        <DappQLCacheProvider {...cacheOptions}>{children}</DappQLCacheProvider>
      </Context.Provider>
    </DAppProvider>
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
