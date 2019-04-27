/* eslint-disable require-jsdoc */
$(function() {
  var config = {
    apiKey: "AIzaSyCDqjEvJZps40rpbvCz_gs--mQqIE3DMJg",
    authDomain: "test-chatapp-a7cbe.firebaseapp.com",
    databaseURL: "https://test-chatapp-a7cbe.firebaseio.com",
    projectId: "test-chatapp-a7cbe",
    storageBucket: "test-chatapp-a7cbe.appspot.com",
    messagingSenderId: "189037178542"
  };
  firebase.initializeApp(config);
  const newPostRef = firebase.database();
  console.log(newPostRef);

  // Peer object
  const peer = new Peer({
    //key: window.__SKYWAY_KEY__,
    key: "476d762e-6abe-46d6-a6ab-fb23aac32ad9",
    debug: 3
  });

  let localStream;
  let existingCall;

  peer.on("open", () => {
    $("#my-id").text(peer.id);
    //step1();
  });

  // Receiving a call
  peer.on("call", call => {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(localStream);
    step3(call);
  });

  peer.on("error", err => {
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
  });

  //ID登録
  $("#input-id").on("submit", e => {
    newPostRef.ref("video").push({
      peer_id: $("#input-id-2").val()
    });
    console.log($("#input-id-2").val());
  });

  peerCall();

  function peerCall() {
    firebase
      .database()
      .ref()
      .child("video")
      .on("value", snap => {
        console.log(snap.val());
        for (const key in snap.val()) {
          if (snap.val().hasOwnProperty(key)) {
            const element = snap.val()[key];
            console.log(element.peer_id);
            //const call = peer.call(element.peer_id, localStream);
            const call = peer.call(element.peer_id, null, {
              videoReceiveEnabled: true,
              audioReceiveEnabled: true
            });
            step3(call);
          }
        }
      });
  }

  $("#make-call").on("submit", e => {
    e.preventDefault();
    // Initiate a call!

    peerCall();
    // firebase
    //   .database()
    //   .ref()
    //   .child("video")
    //   .on("value", snap => {
    //     console.log(snap.val());
    //     for (const key in snap.val()) {
    //       if (snap.val().hasOwnProperty(key)) {
    //         const element = snap.val()[key];
    //         console.log(element.peer_id);
    //         //const call = peer.call(element.peer_id, localStream);
    //         const call = peer.call(element.peer_id, null, {
    //           videoReceiveEnabled: true,
    //           audioReceiveEnabled: true
    //         });
    //         step3(call);
    //       }
    //     }
    //   });
    //console.log(video);
    //const call = peer.call($("#callto-id").val(), localStream);
  });

  $("#end-call").on("click", () => {
    existingCall.close();
    step2();
  });

  // Retry if getUserMedia fails
  $("#step1-retry").on("click", () => {
    $("#step1-error").hide();
    step1();
  });

  // set up audio and video input selectors
  const audioSelect = $("#audioSource");
  const videoSelect = $("#videoSource");
  const selectors = [audioSelect, videoSelect];

  navigator.mediaDevices.enumerateDevices().then(deviceInfos => {
    const values = selectors.map(select => select.val() || "");
    selectors.forEach(select => {
      const children = select.children(":first");
      while (children.length) {
        select.remove(children);
      }
    });

    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = $("<option>").val(deviceInfo.deviceId);

      if (deviceInfo.kind === "audioinput") {
        option.text(
          deviceInfo.label ||
            "Microphone " + (audioSelect.children().length + 1)
        );
        audioSelect.append(option);
      } else if (deviceInfo.kind === "videoinput") {
        option.text(
          deviceInfo.label || "Camera " + (videoSelect.children().length + 1)
        );
        videoSelect.append(option);
      }
    }

    selectors.forEach((select, selectorIndex) => {
      if (
        Array.prototype.slice.call(select.children()).some(n => {
          return n.value === values[selectorIndex];
        })
      ) {
        select.val(values[selectorIndex]);
      }
    });

    videoSelect.on("change", step1);
    audioSelect.on("change", step1);
  });

  function step1() {
    // Get audio/video stream
    const audioSource = $("#audioSource").val();
    const videoSource = $("#videoSource").val();
    const constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
      video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        $("#my-video").get(0).srcObject = stream;
        localStream = stream;

        if (existingCall) {
          existingCall.replaceStream(stream);
          return;
        }

        step2();
      })
      .catch(err => {
        $("#step1-error").show();
        console.error(err);
      });
  }

  const updateVideoEnabled = enabled => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = enabled;
    }
  };

  function step2() {
    $("#step1, #step3").hide();
    $("#step2").show();
    $("#callto-id").focus();
  }

  function step3(call) {
    // Hang up on an existing call if present
    if (existingCall) {
      existingCall.close();
    }
    // Wait for stream on the call, then set peer video display
    call.on("stream", stream => {
      const el = $("#their-video").get(0);
      el.srcObject = stream;
      el.play();
    });

    // UI stuff
    existingCall = call;
    $("#their-id").text(call.remoteId);
    call.on("close", step2);
    $("#step1, #step2").hide();
    $("#step3").show();
  }
});
