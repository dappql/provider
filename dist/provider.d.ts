import { ComponentType } from 'react';
import { CacheOptions } from '@dappql/cache';
import { QueryParams, Config } from '@usedapp/core';
import { ContractFunctionNames, Params } from '@usedapp/core/dist/esm/src/model/types';
import { BaseContract } from 'ethers';
export { useLookupAddress } from '@dappql/cache';
type ContractCollection = Record<string, BaseContract>;
export type AddressResolverFunction = (contractName: string, chainId?: number) => string | undefined;
export type AddressResolverProps = {
    onResolved: (resolver: AddressResolverFunction) => any;
};
export declare function DappQLProvider({ config, queryParams, cacheOptions, children, onMutationSubmit, onMutationSuccess, onMutationError, addressResolver, AddressResolverComponent, }: {
    config: Config;
    children: any;
    queryParams?: QueryParams;
    cacheOptions?: CacheOptions;
    onMutationSubmit?: <Contracts extends ContractCollection, T extends keyof Contracts>(...args: Params<Contracts[T], ContractFunctionNames<Contracts[T]>>) => any;
    onMutationSuccess?: () => any;
    onMutationError?: (error: Error) => any;
    addressResolver?: AddressResolverFunction;
    AddressResolverComponent?: ComponentType<AddressResolverProps>;
}): JSX.Element;
export declare function useDappQL(queryParams?: QueryParams & CacheOptions): {
    queryParams: {
        chainId: number;
        isStatic?: boolean;
        refresh?: number | "never" | "everyBlock";
        disableCache?: boolean;
        cacheExpiringTime?: number;
    };
    onMutationSubmit?: <Contracts extends ContractCollection, T extends keyof Contracts>(...args: Parameters<Contracts[T]["functions"][ContractFunctionNames<Contracts[T]>]>) => any;
    onMutationSuccess?: () => any;
    onMutationError?: (error: Error) => any;
    addressResolver?: (contractName: string, chainId?: number) => string;
};
