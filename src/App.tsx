import { useEffect } from "react";
import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const SDK_KEY = process.env.VITE_SDK_KEY ?? "";
const BASE_URL = process.env.VITE_BASE_URL ?? "";

function App() {
  const leaveUrl = `${window.location.origin}?meetingEnded=true`;

  const getSignatureFromSDK = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const meetingNumber = searchParams.get("meetingNumber") ?? "";
    const role = searchParams.get("role") ?? "0";
    const response = await fetch(`${BASE_URL}/api/v1/zoom-auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetingNumber: meetingNumber,
        role: role,
      }),
    });
    const data = await response.json();
    startMeeting(data.signature);
  };

  const startMeeting = (signature: string) => {
    document.getElementById("zmmtg-root")!.style.display = "block";
    const searchParams = new URLSearchParams(window.location.search);
    const meetingNumber = searchParams.get("meetingNumber") ?? "";
    const passWord = searchParams.get("password") ?? "";
    const userName = searchParams.get("userName") ?? "guest";
    const userEmail = searchParams.get("userEmail") ?? `${userName}@gmail.com`;

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      disableInvite: true,
      meetingInfo: [],
      success: () => {
        // can this be async?
        ZoomMtg.join({
          sdkKey: SDK_KEY,
          signature: signature,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          userEmail: userEmail,
          success: () => {
            console.log("joined");
          },
          error: (error: unknown) => {
            console.log("error while joining", error);
          },
        });
      },
      error: (error: unknown) => {
        console.log("error while initializing", error);
      },
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isInIframe = window.self !== window.top;
    const meetingEnded = searchParams.get("meetingEnded") === "true";
    if (meetingEnded && isInIframe) {
      window.parent.close();
    } else {
      getSignatureFromSDK();
    }
  }, []);

  return (
    <div className="App">
      <main></main>
    </div>
  );
}

export default App;
