## Safari MV3 Service Worker Bug

This extension demonstrates a critical issue with MV3 service worker management in Safari (Version 17.6 19618.3.11.11.5). The bug causes extension functionality failure, potentially triggered when Safari clears history/cookies (via user action, settings, or ITP). This significantly impacts user experience for extensions using MV3 service worker architecture.

## The Problem

After Safari clears history, all active extension service workers terminate - _is this intended behavior?_ On subsequent service worker activation:

1. Extension service workers enter a corrupted state.
2. The `browser` API becomes `undefined` in the service worker context.
3. Service worker fails to respond to messages or self-recover.

## Reproduction Steps

#### Setup:

1. Install the extension.
2. Open popup, verify messaging works.
3. Clear Safari's history.
4. Reopen extension popup.
5. Observe: Service worker fails to reactivate on new messages. ⚠️

#### Scenario 1:

6. Click "reload runtime".
7. Observe: Message failures due to corrupted service worker. ⚠️
8. Recovery: Click "reload runtime" again.
9. Observe: Service worker recovers.

#### Scenario 2:

6. Deactivate/reactivate extension in Safari settings.
7. Open extension popup.
8. Observe: Message failures due to corrupted service worker. ⚠️
9. Recovery: Deactivate/reactivate again or click "reload runtime".

#### Recovery Methods:

- Reload browser extension runtime twice.
- Reactivate extension twice.
- Wait 30 seconds for stale worker termination.

#### Testing & Inspecting Corrupted State

Popup buttons:

- "Send message": Test immediate communication.
- "Retryable message": Observe recovery after stale worker termination.
- "Reload runtime": Attempt extension reload.

Verify service-worker corrupted state:

1. Inspect extension's service worker.
2. Execute `browser.runtime` (should throw an error).
