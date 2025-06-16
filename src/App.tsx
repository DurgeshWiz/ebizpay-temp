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

  useEffect(() => {
    // Define the event listener for messages from the iframe
    const message_handler = (event: any) => {
      // Ensure the message comes from the correct PayFabric domain

      try {
        const data = JSON.parse(event?.data);
        if (data.type === "EbizTokens") {
          const { CustToken, PmToken } = data;

          // Now you can send this data to the parent window (if needed)
          window.parent.postMessage(
            { type: "ReceivedEbizTokens", CustToken, PmToken },
            "*"
          );
        }
      } catch (err) {}

      // Attach the event listener
      window.addEventListener("message", message_handler);

      // Cleanup function to remove the event listener when component unmounts
      return () => {
        window.removeEventListener("message", message_handler);
      };
    };
  }, []);

  return <iframe src={iframeUrl as any} />;
}

export default App;
