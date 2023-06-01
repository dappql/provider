import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { ContractFunctionNames, Params, TransactionOptions } from '@usedapp/core/dist/esm/src/model';
import { BaseContract } from 'ethers';
type ContractCollection = Record<string, BaseContract>;
export declare function useMasterMutation<Contracts extends ContractCollection, T extends keyof Contracts>(getContract: (contract: T, network: number, address?: string) => Contracts[T], contractName: T, methodName: ContractFunctionNames<Contracts[T]>, optionsOrTransactionName?: TransactionOptions | string): {
    send: (...args: Params<Contracts[T], typeof methodName>) => Promise<TransactionReceipt | undefined>;
    isLoading: boolean;
    state: import("@usedapp/core").TransactionStatus;
    events: import("@ethersproject/abi").LogDescription[];
    resetState: () => void;
};
export type MasterMutation = ReturnType<typeof useMasterMutation>;
export {};
