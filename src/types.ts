import { ContractMethodNames, Params } from '@usedapp/core/dist/esm/src/model'
import { BaseContract } from 'ethers'

export type Request = {
  contractName: string
  contract: (network: number, address?: string) => BaseContract
  method: ContractMethodNames<BaseContract>
  args: Params<BaseContract, ContractMethodNames<BaseContract>>
  returnType?: Awaited<
    ReturnType<BaseContract['functions'][ContractMethodNames<BaseContract>]>
  >[0]
}
export type RequestCollection = Record<string, Request>
