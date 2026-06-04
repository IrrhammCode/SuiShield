// Pre-init: suppress console errors from browser wallet extensions (Rabby, MetaMask, etc.)
// that inject non-serializable connectors into AppKit's ConnectorController.
// This file MUST be imported before @reown/appkit to take effect.
if (typeof window !== "undefined") {
  const _origErr = console.error;
  const _origWarn = console.warn;

  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    // Suppress wallet extension noise
    if (
      msg.includes("ConnectorController") ||
      msg.includes("Coinbase Wallet") ||
      msg.includes("window.web3.currentProvider") ||
      msg.includes("MaxListenersExceededWarning") ||
      msg.includes("Failed to fetch") ||
      msg.includes("emitter.setMaxListeners")
    ) return;
    _origErr.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("MaxListenersExceededWarning") ||
      msg.includes("web3.currentProvider") ||
      msg.includes("Lit is in dev mode")
    ) return;
    _origWarn.apply(console, args);
  };

  // Suppress unhandled promise rejections from RPC connections
  window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason?.message || event.reason || "";
    if (
      typeof msg === "string" &&
      (msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("Load failed") ||
        msg.includes("ERR_NETWORK") ||
        msg.includes("ERR_CONNECTION_REFUSED"))
    ) {
      event.preventDefault();
    }
  });

  // Restore after AppKit initialization completes
  setTimeout(() => {
    console.error = _origErr;
    console.warn = _origWarn;
  }, 3000);
}
