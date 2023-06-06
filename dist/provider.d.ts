import { ComponentType } from 'react';
import { CacheOptions } from '@dappql/cache';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { QueryParams, Config } from '@usedapp/core';
import { ContractFunctionNames, Params } from '@usedapp/core/dist/esm/src/model/types';
import { BaseContract } from 'ethers';
export { useLookupAddress } from '@dappql/cache';
type ContractCollection = Record<string, BaseContract>;
type MutationInfo<Contracts extends ContractCollection, T extends keyof Contracts> = {
    contractAddress: string;
    contractName: T;
    methodName: ContractFunctionNames<Contracts[T]>;
    optionsOrTransactionName?: string;
    submissionId: number;
};
type MutationSubmitInfo<Contracts extends ContractCollection, T extends keyof Contracts> = MutationInfo<Contracts, T> & {
    args: Params<Contracts[T], ContractFunctionNames<Contracts[T]>>;
};
type MutationSuccessInfo<Contracts extends ContractCollection, T extends keyof Contracts> = MutationInfo<Contracts, T> & {
    receipt: TransactionReceipt;
};
type MutationErrorInfo<Contracts extends ContractCollection, T extends keyof Contracts> = MutationInfo<Contracts, T> & {
    error: Error;
    receipt?: TransactionReceipt;
};
type MutationCallbacks = {
    onMutationSubmit?: <Contracts extends ContractCollection, T extends keyof Contracts>(info: MutationSubmitInfo<Contracts, T>) => any;
    onMutationSuccess?: <Contracts extends ContractCollection, T extends keyof Contracts>(info: MutationSuccessInfo<Contracts, T>) => any;
    onMutationError?: <Contracts extends ContractCollection, T extends keyof Contracts>(info: MutationErrorInfo<Contracts, T>) => any;
};
export type AddressResolverFunction = (contractName: string, chainId?: number) => string | undefined;
export type AddressResolverProps = {
    onResolved: (resolver: AddressResolverFunction) => any;
};
export declare function DappQLProvider({ config, queryParams, cacheOptions, children, addressResolver, AddressResolverComponent, onMutationSubmit, onMutationSuccess, onMutationError, }: {
    config: Config;
    children: any;
    queryParams?: QueryParams;
    cacheOptions?: CacheOptions;
    addressResolver?: AddressResolverFunction;
    AddressResolverComponent?: ComponentType<AddressResolverProps>;
} & MutationCallbacks): JSX.Element;
export declare function useDappQL(queryParams?: QueryParams & CacheOptions): {
    queryParams: {
        chainId: number;
        isStatic?: boolean;
        refresh?: number | "never" | "everyBlock";
        disableCache?: boolean;
        cacheExpiringTime?: number;
    };
    addressResolver?: (contractName: string, chainId?: number) => string;
    onMutationSubmit?: <Contracts extends ContractCollection, T extends keyof Contracts>(info: MutationSubmitInfo<Contracts, T>) => any;
    onMutationSuccess?: <Contracts_1 extends ContractCollection, T_1 extends keyof Contracts_1>(info: MutationSuccessInfo<Contracts_1, T_1>) => any;
    onMutationError?: <Contracts_2 extends ContractCollection, T_2 extends keyof Contracts_2>(info: MutationErrorInfo<Contracts_2, T_2>) => any;
};
