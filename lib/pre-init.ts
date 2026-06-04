// Minimal console noise suppression for wallet browser extensions.
// Wallet extensions (MetaMask, Rabby, Coinbase) inject console errors
// that are completely harmless but noisy during development.
if (typeof window !== "undefined") {
  const _origErr = console.error;
  const _origWarn = console.warn;

  const safeStringify = (arg: unknown): string => {
    if (arg instanceof Error) return arg.message + " " + (arg.stack || "");
    if (typeof arg === "string") return arg;
    try { return JSON.stringify(arg); } catch { return String(arg); }
  };

  console.error = (...args: unknown[]) => {
    const msg = args.map(safeStringify).join(" ");
    if (
      msg.includes("Coinbase Wallet") ||
      msg.includes("window.web3.currentProvider")
    ) return;
    _origErr.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    const msg = args.map(safeStringify).join(" ");
    if (
      msg.includes("web3.currentProvider") ||
      msg.includes("Lit is in dev mode")
    ) return;
    _origWarn.apply(console, args);
  };
}
