import { ComponentType, ReactElement, useMemo } from 'react'

import { CacheOptions } from '@dappql/cache'
import { QueryParams, useEthers } from '@usedapp/core'
import { ContractMethodNames, Params } from '@usedapp/core/dist/esm/src/model'
import { BaseContract } from 'ethers'

import { useCalls } from './hooks'
import { useDappQL } from './provider'

type Request = {
  contractName: string
  contract: (network: number, address?: string) => BaseContract
  method: ContractMethodNames<BaseContract>
  args: Params<BaseContract, ContractMethodNames<BaseContract>>
  returnType?: Awaited<
    ReturnType<BaseContract['functions'][ContractMethodNames<BaseContract>]>
  >[0]
}

type RequestCollection = Record<string, Request>

export function useMasterQuery<
  Requests extends RequestCollection,
  T extends Requests,
>(
  requests: T,
  queryParams: QueryParams & CacheOptions = {},
): {
  data: { [K in keyof T]: NonNullable<T[K]['returnType']> }
  isLoading: boolean
  error: Error | undefined
  stale?: boolean
} {
  const { queryParams: finalQueryParams, addressResolver } =
    useDappQL(queryParams)
  const queryIndex = JSON.stringify({ requests, queryParams: finalQueryParams })

  const { callKeys, calls } = useMemo(() => {
    const callKeys = Object.keys(requests) as (keyof T)[]
    const calls = callKeys.map((c) => {
      const req = requests[c]
      return {
        contract: req.contract(
          finalQueryParams.chainId,
          addressResolver?.(req.contractName, finalQueryParams.chainId),
        ),
        method: req.method,
        args: req.args,
      }
    })
    return { callKeys, calls }
  }, [queryIndex])

  const { stale, value: result } = useCalls(calls, finalQueryParams)
  const error = result.find((r) => r?.error)?.error
  const loadedValues = result.filter((result) => result?.value)
  const isLoading = loadedValues.length !== calls.length

  const data = useMemo(() => {
    const requestWithData = {} as {
      [K in keyof T]: NonNullable<T[K]['returnType']>
    }
    callKeys.forEach((k, index) => {
      requestWithData[k] =
        result[index]?.value?.length > 1
          ? result[index]?.value
          : result[index]?.value?.[0]
    })
    return requestWithData
  }, [result, callKeys])

  return { data, isLoading, error, stale }
}

export type ErrorMessageProps = { message?: string }

export type ComponentsProps<
  Requests extends RequestCollection,
  T extends Requests,
> = {
  errorComponent?: ComponentType<ErrorMessageProps>
  loadingComponent?: ComponentType<any>
} & (
  | {
      component: ComponentType<{
        data: {
          [K in keyof T]: NonNullable<T[K]['returnType']>
        }
      }>
      children?: (data: {
        [K in keyof T]: NonNullable<T[K]['returnType']>
      }) => ReactElement<any, any>
    }
  | {
      component?: ComponentType<{
        data: {
          [K in keyof T]: NonNullable<T[K]['returnType']>
        }
      }>
      children: (data: {
        [K in keyof T]: NonNullable<T[K]['returnType']>
      }) => ReactElement<any, any>
    }
)

export type QueryContainerProps<
  Requests extends RequestCollection,
  T extends Requests,
> = {
  query: T
  queryParams?: QueryParams
} & ComponentsProps<Requests, T>

function SafeQueryContainer<
  Requests extends RequestCollection,
  T extends Requests,
>(props: QueryContainerProps<Requests, T>) {
  const { data, error, isLoading } = useMasterQuery<Requests, T>(
    props.query,
    props.queryParams,
  )

  if (error) {
    return props.errorComponent ? (
      <props.errorComponent message={error.message} />
    ) : null
  }

  if (isLoading) {
    return props.loadingComponent ? <props.loadingComponent /> : null
  }

  return props.component ? (
    <props.component data={data} />
  ) : (
    props.children?.(data) || null
  )
}

export function MasterQueryContainer<
  Requests extends RequestCollection,
  T extends Requests,
>(props: QueryContainerProps<Requests, T>) {
  const { queryParams } = useDappQL(props.queryParams)

  if (!queryParams?.chainId) {
    return props.errorComponent ? (
      <props.errorComponent message="Invalid Network" />
    ) : null
  }
  return <SafeQueryContainer<Requests, T> {...props} />
}

export type AccountQueryContainerProps<
  Requests extends RequestCollection,
  T extends Requests,
> = {
  query: (account: string) => T
  queryParams?: QueryParams
  noAccountComponent?: ComponentType<any>
} & ComponentsProps<Requests, T>

export function MasterAccountQueryContainer<
  Requests extends RequestCollection,
  T extends Requests,
>(props: AccountQueryContainerProps<Requests, T>) {
  const { account } = useEthers()

  const { noAccountComponent: NoAccountComponent, query, ...other } = props

  if (!account) {
    return NoAccountComponent ? <NoAccountComponent /> : null
  }

  const queryWithAccount = query(account)
  return (
    <MasterQueryContainer<Requests, T> {...other} query={queryWithAccount} />
  )
}
