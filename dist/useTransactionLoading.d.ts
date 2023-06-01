import { TransactionStatus, useContractFunction } from '@usedapp/core';
export type TransactionType = ReturnType<typeof useContractFunction>;
export declare function useTransactionLoading(state: TransactionStatus): boolean;
