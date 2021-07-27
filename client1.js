const ws = require('ws');

const socket = new ws("ws://127.0.0.1:8080");

socket.on("open", () => {
  socket.send(JSON.stringify({Teste: "Ola" }));
});

socket.on("message", (data) => {
  console.log(">>>message:", data.toString());

  // socket.close();
});