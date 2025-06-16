import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  // Function to parse the URL query parameters
  const parseUrlAndSendMessage = () => {
    const params = new URLSearchParams(window.location.search);
    const CustToken = params.get("CustToken");
    const PmToken = params.get("PmToken");
    const iframeUrl = params.get("iframeUrl");

    if (iframeUrl) {
      setIframeUrl(iframeUrl);
    }

    if (CustToken && PmToken) {
      const payload = {
        type: "EbizTokens",
        CustToken,
        PmToken,
      };
      // Send to the parent frame — adjust targetOrigin as needed
      window.parent.postMessage(payload, "*");
    } else {
      console.warn("EbizPay: Missing CustToken or PmToken in URL");
    }
  };

  useEffect(() => {
    // Call to handle initial render and URL parsing
    parseUrlAndSendMessage();

    // Listen for changes in the URL query parameters (on popstate or pushstate)
    const handleUrlChange = () => {
      parseUrlAndSendMessage();
    };

    // Listen for popstate event (back/forward navigation)
    window.addEventListener("popstate", handleUrlChange);

    // Listen for pushState/replaceState in case the URL changes via the History API
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      handleUrlChange();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      handleUrlChange();
    };

    // Cleanup on unmount
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return <iframe src={iframeUrl as any} />;
}

export default App;
