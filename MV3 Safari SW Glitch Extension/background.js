try {
  /** Check if the `browser` API is available - if
   * not, the service worker is in a corrupted state. */
  const valid = typeof browser !== "undefined";

  function logger(...messages) {
    const log = valid ? console.log : console.warn;
    log(new Date().toISOString(), ...messages, `[runtime=${valid}]`);
  }

  logger("Service worker activated");

  if (valid) {
    /** Note: If `valid` is false, no listener will be set up, effectively
     * rendering the service worker non-functional for messaging */
    browser.runtime.onMessage.addListener(async (message) => {
      logger("Message received", JSON.stringify(message));
      return { ok: true };
    });
  }
} catch (err) {
  logger("Service worker failure", err);
}
