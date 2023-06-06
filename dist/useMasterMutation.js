"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMasterMutation = void 0;
const react_1 = require("react");
const core_1 = require("@usedapp/core");
const provider_1 = require("./provider");
const useTransactionLoading_1 = require("./useTransactionLoading");
function useMasterMutation(getContract, contractName, methodName, optionsOrTransactionName) {
    const { queryParams: { chainId }, addressResolver, onMutationSubmit, onMutationSuccess, onMutationError, } = (0, provider_1.useDappQL)();
    const { chainId: providerChainId } = (0, core_1.useEthers)();
    const contractAddress = (0, react_1.useMemo)(() => addressResolver?.(contractName.toString(), chainId), [contractName, chainId, addressResolver]);
    const contract = (0, react_1.useMemo)(() => getContract(contractName, chainId, contractAddress), [getContract, contractName, chainId, contractAddress]);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [submissionId, setSubmissionId] = (0, react_1.useState)(0);
    const options = (0, react_1.useMemo)(() => typeof optionsOrTransactionName === 'string'
        ? { transactionName: optionsOrTransactionName }
        : optionsOrTransactionName, [optionsOrTransactionName]);
    const transaction = (0, core_1.useContractFunction)(contract, methodName, {
        transactionName: options?.transactionName || methodName,
    });
    const isLoading = (0, useTransactionLoading_1.useTransactionLoading)(transaction.state) || submitting;
    const mutationInfo = {
        contractAddress,
        contractName,
        methodName,
        transactionName: options?.transactionName || '',
    };
    const send = (0, react_1.useCallback)(async (...args) => {
        setSubmitting(true);
        const newSubmissionId = Date.now();
        setSubmissionId(newSubmissionId);
        onMutationSubmit({
            ...mutationInfo,
            submissionId: newSubmissionId,
            args,
        });
        if (!providerChainId) {
            onMutationError({
                ...mutationInfo,
                submissionId: 0,
                error: new Error('Invalid Chain'),
            });
            return;
        }
        const receipt = await transaction.send(...args);
        return receipt;
    }, [transaction.send, chainId, providerChainId, contract]);
    (0, react_1.useEffect)(() => {
        if (transaction.state.status === 'Exception') {
            onMutationError({
                ...mutationInfo,
                submissionId,
                receipt: transaction.state.receipt,
                error: new Error(transaction.state.errorMessage),
            });
        }
        else if (transaction.state.status === 'Success') {
            onMutationSuccess({
                ...mutationInfo,
                submissionId,
                receipt: transaction.state.receipt,
            });
        }
        if (['Exception', 'Fail', 'Success'].includes(transaction.state.status)) {
            setSubmitting(false);
        }
    }, [transaction.state.status]);
    (0, react_1.useEffect)(() => {
        if (!isLoading) {
            transaction.resetState();
        }
    }, [isLoading]);
    return {
        ...transaction,
        send,
        isLoading,
    };
}
exports.useMasterMutation = useMasterMutation;
