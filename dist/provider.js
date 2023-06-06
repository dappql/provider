"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDappQL = exports.DappQLProvider = exports.useLookupAddress = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const cache_1 = __importDefault(require("@dappql/cache"));
const core_1 = require("@usedapp/core");
var cache_2 = require("@dappql/cache");
Object.defineProperty(exports, "useLookupAddress", { enumerable: true, get: function () { return cache_2.useLookupAddress; } });
const Context = (0, react_1.createContext)({});
function DappQLProvider({ config, queryParams = {}, cacheOptions = {}, children, addressResolver, AddressResolverComponent, onMutationSubmit, onMutationSuccess, onMutationError, }) {
    const [addressResolverState, setAddressResolver] = (0, react_1.useState)({ callback: addressResolver });
    return ((0, jsx_runtime_1.jsx)(cache_1.default, { ...cacheOptions, children: (0, jsx_runtime_1.jsx)(core_1.DAppProvider, { config: config, children: (0, jsx_runtime_1.jsxs)(Context.Provider, { value: {
                    queryParams,
                    onMutationSubmit,
                    onMutationSuccess,
                    onMutationError,
                    addressResolver: addressResolverState.callback,
                }, children: [AddressResolverComponent ? ((0, jsx_runtime_1.jsx)(AddressResolverComponent, { onResolved: (callback) => {
                            setAddressResolver({ callback });
                        } })) : null, !AddressResolverComponent || addressResolverState.callback
                        ? children
                        : null] }) }) }));
}
exports.DappQLProvider = DappQLProvider;
function useDappQL(queryParams = {}) {
    const context = (0, react_1.useContext)(Context);
    const { chainId } = (0, core_1.useEthers)();
    return {
        ...context,
        queryParams: {
            ...context.queryParams,
            ...queryParams,
            chainId: queryParams.chainId || context.queryParams.chainId || chainId,
        },
    };
}
exports.useDappQL = useDappQL;
