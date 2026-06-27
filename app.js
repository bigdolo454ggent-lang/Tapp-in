const socket = io();

/* ---------------- STATE ---------------- */
let pc = null;
let localStream = null;
let remoteId = null;
let incomingOffer = null;

let timer = null;
let seconds = 0;

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

/* ---------------- CHAT ---------------- */
function sendMsg() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;

  socket.emit("chat-message", input.value);
  input.value = "";
}

socket.on("chat-message", (msg) => {
  const chat = document.getElementById("chat");
  chat.innerHTML += `<div>${msg}</div>`;
});

/* ---------------- TIMER ---------------- */
function startTimer() {
  stopTimer();
  seconds = 0;

  timer = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").innerText = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  seconds = 0;
  document.getElementById("timer").innerText = "00:00";
}

/* ---------------- CALL INIT ---------------- */
async function startCall(targetId) {
  if (!targetId) return alert("No target user");

  remoteId = targetId;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  document.getElementById("localVideo").srcObject = localStream;

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject =
      event.streams[0];
  };

  pc.onicecandidate = (event) => {
    if (!event.candidate) return;

    socket.emit("ice-candidate", {
      to: remoteId,
      candidate: event.candidate
    });
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("call-user", {
    to: remoteId,
    from: socket.id,
    offer
  });
}

/* ---------------- INCOMING CALL ---------------- */
socket.on("incoming-call", ({ from, offer }) => {
  remoteId = from;
  incomingOffer = offer;

  document.getElementById("callerName").innerText =
    `Incoming call`;

  document.getElementById("callPopup").style.display = "block";
});

/* ---------------- ACCEPT CALL ---------------- */
async function acceptCall() {
  document.getElementById("callPopup").style.display = "none";

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  document.getElementById("localVideo").srcObject = localStream;

  pc = new RTCPeerConnection(config);

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  pc.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject =
      event.streams[0];
  };

  pc.onicecandidate = (event) => {
    if (!event.candidate) return;

    socket.emit("ice-candidate", {
      to: remoteId,
      candidate: event.candidate
    });
  };

  await pc.setRemoteDescription(incomingOffer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("accept-call", {
    to: remoteId,
    answer
  });

  startTimer();
}

/* ---------------- REJECT CALL ---------------- */
function rejectCall() {
  document.getElementById("callPopup").style.display = "none";

  socket.emit("reject-call", {
    to: remoteId
  });

  remoteId = null;
  incomingOffer = null;
}

/* ---------------- END CALL ---------------- */
function endCall() {
  if (pc) {
    pc.close();
    pc = null;
  }

  socket.emit("end-call", {
    to: remoteId
  });

  remoteId = null;
  stopTimer();
}

/* ---------------- ICE ---------------- */
socket.on("ice-candidate", async ({ candidate }) => {
  try {
    if (pc && candidate) {
      await pc.addIceCandidate(candidate);
    }
  } catch (e) {}
});

/* ---------------- CALL ACCEPTED ---------------- */
socket.on("call-accepted", async ({ answer }) => {
  if (!pc) return;

  await pc.setRemoteDescription(answer);
  startTimer();
});

/* ---------------- CALL ENDED ---------------- */
socket.on("call-ended", () => {
  if (pc) {
    pc.close();
    pc = null;
  }
  stopTimer();
});

