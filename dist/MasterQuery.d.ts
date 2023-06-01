import { ComponentType, ReactElement } from 'react';
import { CacheOptions } from '@dappql/cache';
import { QueryParams } from '@usedapp/core';
import { ContractMethodNames, Params } from '@usedapp/core/dist/esm/src/model';
import { BaseContract } from 'ethers';
type Request = {
    contractName: string;
    contract: (network: number, address?: string) => BaseContract;
    method: ContractMethodNames<BaseContract>;
    args: Params<BaseContract, ContractMethodNames<BaseContract>>;
    returnType?: Awaited<ReturnType<BaseContract['functions'][ContractMethodNames<BaseContract>]>>[0];
};
type RequestCollection = Record<string, Request>;
export declare function useMasterQuery<Requests extends RequestCollection, T extends Requests>(requests: T, queryParams?: QueryParams & CacheOptions): {
    data: {
        [K in keyof T]: NonNullable<T[K]['returnType']>;
    };
    isLoading: boolean;
    error: Error | undefined;
    stale?: boolean;
};
export type ErrorMessageProps = {
    message?: string;
};
export type ComponentsProps<Requests extends RequestCollection, T extends Requests> = {
    errorComponent?: ComponentType<ErrorMessageProps>;
    loadingComponent?: ComponentType<any>;
} & ({
    component: ComponentType<{
        data: {
            [K in keyof T]: NonNullable<T[K]['returnType']>;
        };
    }>;
    children?: (data: {
        [K in keyof T]: NonNullable<T[K]['returnType']>;
    }) => ReactElement<any, any>;
} | {
    component?: ComponentType<{
        data: {
            [K in keyof T]: NonNullable<T[K]['returnType']>;
        };
    }>;
    children: (data: {
        [K in keyof T]: NonNullable<T[K]['returnType']>;
    }) => ReactElement<any, any>;
});
export type QueryContainerProps<Requests extends RequestCollection, T extends Requests> = {
    query: T;
    queryParams?: QueryParams;
} & ComponentsProps<Requests, T>;
export declare function MasterQueryContainer<Requests extends RequestCollection, T extends Requests>(props: QueryContainerProps<Requests, T>): JSX.Element;
export type AccountQueryContainerProps<Requests extends RequestCollection, T extends Requests> = {
    query: (account: string) => T;
    queryParams?: QueryParams;
    noAccountComponent?: ComponentType<any>;
} & ComponentsProps<Requests, T>;
export declare function MasterAccountQueryContainer<Requests extends RequestCollection, T extends Requests>(props: AccountQueryContainerProps<Requests, T>): JSX.Element;
export {};
