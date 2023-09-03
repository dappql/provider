import { Provider } from '@ethersproject/abstract-provider'
import { Contract } from 'ethers'

export const MAX_MULTICALLS = 500

const ABI = [
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public view returns (tuple(bool success, bytes returnData)[])',
]

const getMulticall2Contract = (provider: Provider, multicallAddress: string) =>
  new Contract(multicallAddress, ABI, provider)

export async function multicall2(
  requests: [string, string][],
  provider: Provider,
  address: string,
) {
  const blockNumber = await provider.getBlockNumber()

  return (await getMulticall2Contract(provider, address).tryAggregate(
    false,
    requests,
    {
      blockTag: blockNumber,
    },
  )) as {
    success?: boolean
    returnData: string
  }[]
}

export type MultiCallItem = {
  contract: Contract
  method: string
  args?: any[]
}

export async function masterMulticall(
  calls: MultiCallItem[],
  provider: Provider,
  multicallAddress: string,
) {
  const encodedCalls = calls.map(
    (c) =>
      [
        c.contract.address,
        c.contract.interface.encodeFunctionData(c.method, c.args),
      ] as [string, string],
  )
  const results = await multicall2(encodedCalls, provider, multicallAddress)
  return results.map((r, index) => {
    const call = calls[index]
    return {
      ...call,
      success: r.success,
      result: r.success
        ? call.contract.interface.decodeFunctionResult(
            call.method,
            r.returnData,
          )
        : undefined,
    }
  })
}
