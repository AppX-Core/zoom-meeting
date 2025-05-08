import { useEffect } from "react";
import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import KJUR from "jsrsasign";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const SDK_KEY = process.env.VITE_SDK_KEY ?? "";
const SDK_SECRET = process.env.VITE_SDK_SECRET ?? "";

function generateSignature(meetingNumber: string) {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const header = { alg: "HS256", typ: "JWT" };

  const payload = {
    appKey: SDK_KEY,
    mn: meetingNumber,
    role: 0,
    iat: iat,
    exp: exp,
    tokenExp: exp,
  };

  const sHeader = JSON.stringify(header);
  const sPayload = JSON.stringify(payload);

  // @ts-expect-error - jws is not typed
  return KJUR.jws.JWS.sign("HS256", sHeader, sPayload, SDK_SECRET);
}

function App() {
  const leaveUrl = `${window.location.origin}?meetingEnded=true`;

  const getSignatureFromSDK = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const meetingNumber = searchParams.get("meetingNumber") ?? "";
    const signature = generateSignature(meetingNumber);
    startMeeting(signature);
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
