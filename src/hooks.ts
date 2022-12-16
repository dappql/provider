import {
  CacheOptions,
  QueryEthAddress,
  useCall as useCallCache,
  useCalls as useCallsCache,
  useEtherBalance as useEtherBalanceCache,
  useToken as useTokenCache,
  useTokenAllowance as useTokenAllowanceCache,
  useTokenBalance as useTokenBalanceCache,
} from '@dappql/cache'
import { Call, QueryParams } from '@usedapp/core'
import {
  ContractMethodNames,
  Falsy,
  TypedContract,
} from '@usedapp/core/dist/esm/src/model'

import { useDappQL } from './provider'

export { useLookupAddress } from '@dappql/cache'

export function useCall<
  T extends TypedContract,
  MN extends ContractMethodNames<T>,
>(call: Call<T, MN> | Falsy, queryParams: QueryParams & CacheOptions = {}) {
  const dappql = useDappQL(queryParams)
  return useCallCache(call, dappql.queryParams)
}

export function useCalls(
  calls: (Call | Falsy)[],
  queryParams: QueryParams & CacheOptions = {},
) {
  const dappql = useDappQL(queryParams)
  return useCallsCache(calls, dappql.queryParams)
}

export function useEtherBalance(
  address: QueryEthAddress,
  queryParams: QueryParams & CacheOptions = {},
) {
  const dappql = useDappQL(queryParams)
  return useEtherBalanceCache(address, dappql.queryParams)
}

export function useToken(
  tokenAddress: QueryEthAddress,
  queryParams: QueryParams & CacheOptions = {},
) {
  const dappql = useDappQL(queryParams)
  return useTokenCache(tokenAddress, dappql.queryParams)
}

export function useTokenAllowance(
  tokenAddress: QueryEthAddress,
  ownerAddress: QueryEthAddress,
  spenderAddress: QueryEthAddress,
  queryParams: QueryParams & CacheOptions = {},
) {
  const dappql = useDappQL(queryParams)
  return useTokenAllowanceCache(
    tokenAddress,
    ownerAddress,
    spenderAddress,
    dappql.queryParams,
  )
}

export function useTokenBalance(
  tokenAddress: QueryEthAddress,
  address: QueryEthAddress,
  queryParams: QueryParams & CacheOptions = {},
) {
  const dappql = useDappQL(queryParams)
  return useTokenBalanceCache(tokenAddress, address, dappql.queryParams)
}
