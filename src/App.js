import React, { useEffect } from "react";

import "./App.css";
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.17.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

function App() {
  const searchParams = new URLSearchParams(window.location.search);

  var authEndpoint = "";
  var sdkKey = "";
  var meetingNumber = searchParams.get("meetingNumber");
  var passWord = searchParams.get("password");
  var role = 0;
  var userName = searchParams.get("userName");
  var userEmail = "";
  var registrantToken = "";
  var zakToken = "";
  var leaveUrl = "http://localhost:3000?meetingEnded=true";
  const SDK_KEY = "pYYW4T4l8wtgdt88O2V01ziMIEkXXJId5Gog";
  const SDK_SECRET = "qnUQzrSdNnWZWURAdrKHs8MhMZ3IisQFWfay";
  debugger;
  function getSignature(e) {
    //e.preventDefault();
    ZoomMtg.generateSDKSignature({
      meetingNumber: meetingNumber,
      sdkKey: SDK_KEY,
      sdkSecret: SDK_SECRET,
      role: 0,
      inviteUrlFormat: "",
      disableInvite: true,
      success: function (res) {
        startMeeting(res.result);
      },
    });
    // fetch(authEndpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     meetingNumber: meetingNumber,
    //     role: role
    //   })
    // }).then(res => res.json())
    // .then(response => {
    //   startMeeting(response.signature)
    // }).catch(error => {
    //   console.error(error)
    // })
  }

  function startMeeting(signature) {
    document.getElementById("zmmtg-root").style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        console.log(success);

        ZoomMtg.join({
          signature: signature,
          sdkKey: SDK_KEY,
          meetingNumber: meetingNumber,
          passWord: passWord,
          userName: userName,
          // userEmail: userEmail,
          // tk: registrantToken,
          // zak: zakToken,
          success: (success) => {
            console.log(success);
            ZoomMtg.showInviteFunction({ show: false });
            ZoomMtg.lea;
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  useEffect(() => {
    if (searchParams.meetingEnded == "true") {
      window.history.back();
    } else {
      getSignature();
    }
  }, []);

  return (
    <div className="App">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>

        <button onClick={getSignature}>Join Meeting</button>
      </main>
    </div>
  );
}

export default App;
