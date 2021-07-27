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
  
});

socket.on("message", (data) => {
  const obj = JSON.parse(data);
  if(obj.command === 'create_user'){
    user = obj.user;
  }else if(obj.command === 'joined_room'){
    room = obj.data.room;
    inRoom = true;

    console.log(`Você está na sala: ${room}`);
    console.log("Usuários na sala:");
    obj.data.participants.map((p) => {
      console.log(`>>${p}`);
    });
    console.log("Se você for administrador pode digitar '/ban nome_do_usuario' para banir um usuário da sala");
    console.log("Você pode a qualquer momento digitar '/quit' para sair da sala");
  }else if(obj.command === 'message'){
    console.log(`>>>${obj.user}: ${obj.data}`)
  }else if(obj.command === 'list_rooms'){
    console.log("Salas")
    obj.data.map((room) => {
      console.log(`>>>${room.room}`);
    });
  }else if(obj.command === 'failed_to_join'){
    console.log(obj.data);
  }else if(obj.command === 'quit_success'){
    inRoom = false;

    console.log("Você deixou a sala com sucesso");

    console.log("Digite:"+
                "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                "\n>>>'/list' -> para listar as salas");

    console.log("Salas");
    obj.data.map((room) => {
      console.log(`>>>${room.room}`);
    });
  }else if(obj.command === 'create_success'){
    room = obj.data;
    inRoom = true;
    console.log("Sala criada com sucesso!");
    console.log("Você está agora na sala que criou, digite /quit para sair");
  }else if(obj.command === 'ban_success'){
    console.log(obj.data);
  }else if(obj.command === 'failed_ban'){
    console.log(obj.data);
  }else if(obj.command === 'create_fail'){
    console.log(obj.data);
  }else if(obj.command === 'banned'){
    room = "";
    inRoom = false;
    console.log(`Você foi banido da sala ${obj.data.room} pelo usuário ${obj.user}` );
    console.log("Digite:"+
                "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                "\n>>>'/list' -> para listar as salas");

    console.log("Salas");
    obj.data.rooms.map((room) => {
      console.log(`>>>${room.room}`);
    });
  }
});

console.log("Digite:"+
                "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                "\n>>>'/list' -> para listar as salas");

rl.on('line', line => {
  // if (line === "FIM") {
  //     rl.close();
  // }
  if(line.slice(0,5)==="/join" && (inRoom === false)){ 
    socket.send(JSON.stringify({user: user, command: 'join', data: line.slice(6)}));
  } else if(line.slice(0,7)==="/create" && inRoom===false){
    socket.send(JSON.stringify({user: user, command: 'create', data: line.slice(8)}));
  }else if(line.slice(0,5)==="/list" && inRoom===false){
    socket.send(JSON.stringify({user: user, command: 'list', data: ""}));
  }else if(line.slice(0,5)==="/quit" && inRoom===true){
    socket.send(JSON.stringify({user: user, command: 'quit', data: room}));
  }else if(line.slice(0,4)==="/ban" && inRoom===true){
    console.log("entrou");
    socket.send(JSON.stringify({user: user, command: 'ban', data: {user: line.slice(5), room: room}}));
  } else if(inRoom===true){
    socket.send(JSON.stringify({user: user, command: 'message', data: {room, message: line}}));
  } else {
    console.log("Você digitou um comando inválido!");
  }

});