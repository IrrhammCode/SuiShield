// Pre-init: suppress console errors from browser wallet extensions (Rabby, MetaMask, etc.)
// that inject non-serializable connectors into AppKit's ConnectorController.
// This file MUST be imported before @reown/appkit to take effect.
if (typeof window !== "undefined") {
  const _origErr = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("ConnectorController")) return;
    _origErr.apply(console, args);
  };
  // Restore after AppKit initialization completes
  setTimeout(() => { console.error = _origErr; }, 1000);
}
