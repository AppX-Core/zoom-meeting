import { useEffect } from "react";
import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const SDK_KEY = process.env.VITE_SDK_KEY ?? "";
const SDK_SECRET = process.env.VITE_SDK_SECRET ?? "";

const ROLE = {
  PARTICIPANT: "0",
  HOST: "1",
};

function App() {
  const leaveUrl = `${window.location.origin}?meetingEnded=true`;

  const getSignatureFromSDK = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const meetingNumber = searchParams.get("meetingNumber") ?? "";
    ZoomMtg.generateSDKSignature({
      sdkKey: SDK_KEY,
      sdkSecret: SDK_SECRET,
      meetingNumber: meetingNumber,
      role: ROLE.PARTICIPANT,
      success: (res: any) => {
        startMeeting(res);
      },
    });
  };

  function startMeeting(signature: string) {
    document.getElementById("zmmtg-root")!.style.display = "block";
    const searchParams = new URLSearchParams(window.location.search);
    const meetingNumber = searchParams.get("meetingNumber") ?? "";
    const passWord = searchParams.get("password") ?? "";
    const userName = searchParams.get("userName") ?? "";

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
  }

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
