const reloadBtn = document.getElementById("reload");
const sendBtn = document.getElementById("send");
const sendRetryBtn = document.getElementById("sendRetry");
const statusEl = document.getElementById("status");

/** Performs a sanity check for the browser runtime
 * API availability in the popup context */
function checkRuntime() {
  try {
    return typeof browser?.runtime !== "undefined";
  } catch {
    return false;
  }
}

function logger(message) {
  const el = document.getElementById("logs");
  const value = el.value;
  el.value = `[${new Date().toUTCString()}] ${message}\n${value}`;
}

/** Attempts to reload the extension's runtime.
 * This function **shou re-start the service worker in a correct state.
 * After clearing cookies/history, the first reload call may spawn the
 * service worker in a corrupted state without access to the `browser` API */
function reloadRuntime(_evt) {
  browser.runtime.reload();
}

/** Sends a test message to the service worker and logs the response.
 * This function is used to check if the service worker is in a valid
 * and ready state. A global `onMessage` listener is set up in `background.js`
 * to handle this message. When the service-worker is in a "corrupted"
 * state, responses will be `undefined` */
function sendMessage(_evt) {
  return browser.runtime
    .sendMessage({ type: "test" })
    .then((res) => {
      const ok = Boolean(res?.ok);
      if (!ok) logger(`Message failure [invalid]`);
      else logger(`Message response [${JSON.stringify(res)}]`);
      return ok;
    })
    .catch((err) => {
      logger(`Message failure [${err.name}]`);
      return false;
    })
    .then((success) => {
      const status = success ? "ready" : "error";
      statusEl.innerText = status;
      statusEl.className = status;
      return success;
    });
}

/** Attempts to send a message repeatedly with increasing delays.
 * This function is used to test the service worker's responsiveness over
 * time. It stops on the first successful message response or after one minute.
 * Note: A corrupted service worker may extend its lifetime each time a message is sent,
 * even if it doesn't send a valid response. After 30s of inactivity, the worker may
 * respawn in a correct state, allowing messages to go through. */
function sendMessageRetry() {
  let timer;

  const handler = (_evt, delay = 0) => {
    if (delay === 0) clearTimeout(timer);

    return sendMessage().then((success) => {
      const nextDelay = delay + 10;

      if (nextDelay > 60) return logger(`Stopping retry after 1min`);
      if (success) return logger(`Successful communication after ${delay}s`);

      logger(`Retrying communication in ${nextDelay}s`);
      timer = setTimeout(
        () => handler(null, nextDelay),
        (nextDelay + 2.5) * 1_000
      );
    });
  };

  return handler;
}

logger(`Popup loaded [runtime: ${checkRuntime()}]`);
sendMessage(); /* try communicating on popup mount */

reloadBtn.addEventListener("click", reloadRuntime);
sendBtn.addEventListener("click", sendMessage);
sendRetryBtn.addEventListener("click", sendMessageRetry());
