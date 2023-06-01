"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionLoading = void 0;
const react_1 = require("react");
const core_1 = require("@usedapp/core");
const LOADING_STATE = ['PendingSignature', 'Mining'];
function useTransactionLoading(state) {
    const [mining, setMining] = (0, react_1.useState)(false);
    const { notifications } = (0, core_1.useNotifications)();
    const preparing = LOADING_STATE.includes(state.status);
    (0, react_1.useEffect)(() => {
        const transactionNotifications = notifications.filter((n) => n.type !== 'walletConnected' &&
            n.type !== 'transactionPendingSignature' &&
            n.transaction.hash === state.transaction?.hash);
        if (!mining) {
            setMining(!!transactionNotifications.find((n) => n.type === 'transactionStarted'));
        }
        else {
            setMining(!transactionNotifications.find((n) => n.type !== 'transactionStarted'));
        }
    }, [notifications, state.transaction?.hash]);
    return preparing || mining;
}
exports.useTransactionLoading = useTransactionLoading;
