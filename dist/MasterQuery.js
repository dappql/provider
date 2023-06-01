"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterAccountQueryContainer = exports.MasterQueryContainer = exports.useMasterQuery = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const core_1 = require("@usedapp/core");
const hooks_1 = require("./hooks");
const provider_1 = require("./provider");
function useMasterQuery(requests, queryParams = {}) {
    const { queryParams: finalQueryParams, addressResolver } = (0, provider_1.useDappQL)(queryParams);
    const queryIndex = JSON.stringify({ requests, queryParams: finalQueryParams });
    const { callKeys, calls } = (0, react_1.useMemo)(() => {
        const callKeys = Object.keys(requests);
        const calls = callKeys.map((c) => {
            const req = requests[c];
            return {
                contract: req.contract(finalQueryParams.chainId, addressResolver?.(req.contractName, finalQueryParams.chainId)),
                method: req.method,
                args: req.args,
            };
        });
        return { callKeys, calls };
    }, [queryIndex]);
    const { stale, value: result } = (0, hooks_1.useCalls)(calls, finalQueryParams);
    const error = result.find((r) => r?.error)?.error;
    const loadedValues = result.filter((result) => result?.value);
    const isLoading = loadedValues.length !== calls.length;
    const data = (0, react_1.useMemo)(() => {
        const requestWithData = {};
        callKeys.forEach((k, index) => {
            requestWithData[k] =
                result[index]?.value?.length > 1
                    ? result[index]?.value
                    : result[index]?.value?.[0];
        });
        return requestWithData;
    }, [result, callKeys]);
    return { data, isLoading, error, stale };
}
exports.useMasterQuery = useMasterQuery;
function SafeQueryContainer(props) {
    const { data, error, isLoading } = useMasterQuery(props.query, props.queryParams);
    if (error) {
        return props.errorComponent ? ((0, jsx_runtime_1.jsx)(props.errorComponent, { message: error.message })) : null;
    }
    if (isLoading) {
        return props.loadingComponent ? (0, jsx_runtime_1.jsx)(props.loadingComponent, {}) : null;
    }
    return props.component ? ((0, jsx_runtime_1.jsx)(props.component, { data: data })) : (props.children?.(data) || null);
}
function MasterQueryContainer(props) {
    const { queryParams } = (0, provider_1.useDappQL)(props.queryParams);
    if (!queryParams?.chainId) {
        return props.errorComponent ? ((0, jsx_runtime_1.jsx)(props.errorComponent, { message: "Invalid Network" })) : null;
    }
    return (0, jsx_runtime_1.jsx)(SafeQueryContainer, { ...props });
}
exports.MasterQueryContainer = MasterQueryContainer;
function MasterAccountQueryContainer(props) {
    const { account } = (0, core_1.useEthers)();
    const { noAccountComponent: NoAccountComponent, query, ...other } = props;
    if (!account) {
        return NoAccountComponent ? (0, jsx_runtime_1.jsx)(NoAccountComponent, {}) : null;
    }
    const queryWithAccount = query(account);
    return ((0, jsx_runtime_1.jsx)(MasterQueryContainer, { ...other, query: queryWithAccount }));
}
exports.MasterAccountQueryContainer = MasterAccountQueryContainer;
