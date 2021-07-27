const ws = require('ws');
const readline = require('readline');

const socket = new ws("ws://127.0.0.1:8080");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let inRoom = false;
let user;
let room;

socket.on("open", () => {
  socket.send(JSON.stringify({Teste: "Ola" }));
});

socket.on("message", (data) => {
  const obj = JSON.parse(data);
  if(obj.command === 'create_user'){
    user = obj.user;
  }

  if(obj.command === 'joined_room'){
    room = obj.data;
    inRoom = true;
  }

  if(obj.command === 'message'){
    console.log(`>>>${obj.user}: ${obj.data}`)
  }

  if(obj.command === 'list_rooms'){
    console.log("Salas")
    obj.data.map((room) => {
      console.log(`>>>${room.room}`);
    })
  }

  if(obj.command === 'failed_to_join'){
    console.log(obj.data);
  }

  console.log(user);
});

console.log("Digite:"+
                "\n>>>/join nome_da_sala para entrar numa das salas existentes"+
                "\n>>>/create nome_da_sala para criar uma sala nova se for administrador"+
                "\n>>>/delete nome_da_sala para deletar uma sala nova se for administrador");

rl.on('line', line => {
  if (line === "FIM") {
      rl.close();
  }
  
  // imprime na tela a linha digitada
  console.log("Linha digitada: " + line);
});