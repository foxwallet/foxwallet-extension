const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;
let locating;

// There can only be one offscreenDocument. So we create a helper function
// that returns a boolean indicating if a document is already active.
async function hasDocument() {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  // @ts-ignore
  const matchedClients = await clients.matchAll();

  return matchedClients.some(
    // @ts-ignore
    (c) => c.url === chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)
  );
}

async function setupOffscreenDocument(path: string) {
  //if we do not have a document, we are already setup and can skip
  try {
    const has = await hasDocument();
    if (!has) {
      // create offscreen document
      if (creating) {
        await creating;
      } else {
        creating = chrome.offscreen.createDocument({
          url: path,
          reasons: [
            chrome.offscreen.Reason.WORKERS ||
              chrome.offscreen.Reason.LOCAL_STORAGE,
          ],
          justification: "Sync aleo transactions",
        });

        await creating;
        creating = null;
      }
    }
  } catch (err: any) {
    if (!err.message.startsWith("Only a single offscreen")) {
      throw err;
    }
  }
}

export async function sync() {
  console.log("===> before setupOffscreenDocument");

  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

  console.log("===> before sendMessage");
  const privateKey = await chrome.runtime.sendMessage({
    type: "get-private-key",
    target: "offscreen",
  });
  console.log("===> privateKey: ", privateKey);

  await closeOffscreenDocument();
  return privateKey;
}

async function closeOffscreenDocument() {
  const has = await hasDocument();
  if (!has) {
    return;
  }
  await chrome.offscreen.closeDocument();
}
