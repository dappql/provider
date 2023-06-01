import { CacheOptions, QueryEthAddress } from '@dappql/cache';
import { Call, QueryParams } from '@usedapp/core';
import { ContractMethodNames, Falsy, TypedContract } from '@usedapp/core/dist/esm/src/model';
export { useLookupAddress } from '@dappql/cache';
export declare function useCall<T extends TypedContract, MN extends ContractMethodNames<T>>(call: Call<T, MN> | Falsy, queryParams?: QueryParams & CacheOptions): {
    value: any;
    error: Error;
    stale: boolean;
    isLoading: boolean;
};
export declare function useCalls(calls: (Call | Falsy)[], queryParams?: QueryParams & CacheOptions): {
    value: {
        value: any;
        error: Error;
    }[];
    stale: boolean;
    isLoading: boolean;
};
export declare function useEtherBalance(address: QueryEthAddress, queryParams?: QueryParams & CacheOptions): {
    stale: boolean;
    value: import("ethers").BigNumber;
    isLoading: boolean;
};
export declare function useToken(tokenAddress: QueryEthAddress, queryParams?: QueryParams & CacheOptions): {
    stale: boolean;
    value: import("@usedapp/core/dist/esm/src/model/TokenInfo").TokenInfo;
    isLoading: boolean;
};
export declare function useTokenAllowance(tokenAddress: QueryEthAddress, ownerAddress: QueryEthAddress, spenderAddress: QueryEthAddress, queryParams?: QueryParams & CacheOptions): {
    stale: boolean;
    value: import("ethers").BigNumber;
    isLoading: boolean;
};
export declare function useTokenBalance(tokenAddress: QueryEthAddress, address: QueryEthAddress, queryParams?: QueryParams & CacheOptions): {
    stale: boolean;
    value: import("ethers").BigNumber;
    isLoading: boolean;
};
