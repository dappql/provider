"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTokenBalance = exports.useTokenAllowance = exports.useToken = exports.useEtherBalance = exports.useCalls = exports.useCall = exports.useLookupAddress = void 0;
const cache_1 = require("@dappql/cache");
const provider_1 = require("./provider");
var cache_2 = require("@dappql/cache");
Object.defineProperty(exports, "useLookupAddress", { enumerable: true, get: function () { return cache_2.useLookupAddress; } });
function useCall(call, queryParams = {}) {
    const dappql = (0, provider_1.useDappQL)(queryParams);
    return (0, cache_1.useCall)(call, dappql.queryParams);
}
exports.useCall = useCall;
function useCalls(calls, queryParams = {}) {
    const dappql = (0, provider_1.useDappQL)(queryParams);
    return (0, cache_1.useCalls)(calls, dappql.queryParams);
}
exports.useCalls = useCalls;
function useEtherBalance(address, queryParams = {}) {
    const dappql = (0, provider_1.useDappQL)(queryParams);
    return (0, cache_1.useEtherBalance)(address, dappql.queryParams);
}
exports.useEtherBalance = useEtherBalance;
function useToken(tokenAddress, queryParams = {}) {
    const dappql = (0, provider_1.useDappQL)(queryParams);
    return (0, cache_1.useToken)(tokenAddress, dappql.queryParams);
}
exports.useToken = useToken;
function useTokenAllowance(tokenAddress, ownerAddress, spenderAddress, queryParams = {}) {
    const dappql = (0, provider_1.useDappQL)(queryParams);
    return (0, cache_1.useTokenAllowance)(tokenAddress, ownerAddress, spenderAddress, dappql.queryParams);
}
exports.useTokenAllowance = useTokenAllowance;
function useTokenBalance(tokenAddress, address, queryParams = {}) {
    const dappql = (0, provider_1.useDappQL)(queryParams);
    return (0, cache_1.useTokenBalance)(tokenAddress, address, dappql.queryParams);
}
exports.useTokenBalance = useTokenBalance;
