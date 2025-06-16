// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    // Parse the URL search parameters
    const params = new URLSearchParams(window.location.search);
    const CustToken = params.get("CustToken");
    const PmToken = params.get("PmToken");

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
  }, []);

  return null;
}

export default App;
