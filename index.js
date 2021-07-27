const ws = require('ws');

const wss = new ws.Server({ port: 8080 });

const users = [];
const usersWS = [];
let rooms = [{room: "sala_geral", participants: []}];


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const obj = JSON.parse(message);

    if(obj.command === 'join'){
      const tempRoom = rooms.find((room) => room.room === obj.data);
      if(tempRoom !== undefined){
        tempRoom.participants.push(obj.user);
        rooms = rooms.map((room) => {
          if(room.room === tempRoom.room){
            return tempRoom;
          }else{
            return room;
          }
        });
        ws.send(JSON.stringify({user: obj.user, command: "joined_room", data: {room: tempRoom.room, participants: tempRoom.participants}}));
      } else{
        ws.send(JSON.stringify({user: obj.user, command: "failed_to_join", 
                                data: "Ocorreu uma falha para entrar na sala"}));
      }

      console.log(rooms);
    }else if(obj.command === 'list'){
      const userIndex = users.findIndex((user) => user.user === obj.user);

      if(userIndex !== -1){
        usersWS[userIndex].send(JSON.stringify({user: obj.user, command: 'list_rooms', data: rooms}));
      }
    }else if(obj.command === 'message'){
      const tempRoom = rooms.find((room) => room.room === obj.data.room);
      const indexes = users.map((user, index) => {
        if(tempRoom.participants.includes(user.user) && (user.user !== obj.user)){
          return index;
        }
      });
      indexes.map((i) => {
        if(i!==undefined){
          usersWS[i].send(JSON.stringify({user: obj.user, command: "message", data: obj.data.message}));
        }
      });
    } else if(obj.command === 'create'){
      const userIndex = users.findIndex((user) => user.user === obj.user);

      if(userIndex !== -1){
        if(users[userIndex].level === "admnistrator"){
          rooms.push({room: obj.data, participants: [obj.user]});
          usersWS[userIndex].send(JSON.stringify({user: obj.user, command: "create_success", data: obj.data}));
        } else{
          usersWS[userIndex].send(JSON.stringify({user: obj.user, command: "create_fail", data: "Você não tem permissão para criar salas"}));
        }
      }
      console.log(rooms);
    } else if(obj.command === 'quit'){
      const userIndex = users.findIndex((user) => user.user === obj.user);
      const tempRoom = rooms.find((room) => room.room === obj.data);

      if(tempRoom !== undefined){
        tempRoom.participants = tempRoom.participants.filter((p) => p !== obj.user);
        rooms = rooms.map((room) => {
          if(room.room === tempRoom.room){
            return tempRoom;
          }else{
            return room;
          }
        });
      }

      if(userIndex !== -1){
        usersWS[userIndex].send(JSON.stringify({user: obj.user, command: "quit_success", data: rooms}));
      }

      console.log(rooms);
    }
    else if(obj.command === 'ban'){
      const userIndex = users.findIndex((user) => user.user === obj.user);
      const user = users.find((user) => user.user === obj.user);

      if(user !== undefined){
        if(user.level === "admnistrator"){
          const userToBanIndex = users.findIndex((user) => user.user === obj.data.user);
          const tempRoom = rooms.find((room) => room.room === obj.data.room);

          if(tempRoom !== undefined){
            tempRoom.participants = tempRoom.participants.filter((p) => p !== obj.data.user);
            rooms = rooms.map((room) => {
              if(room.room === tempRoom.room){
                return tempRoom;
              }else{
                return room;
              }
            });
          }

          if(userToBanIndex !== -1){
            usersWS[userIndex].send(JSON.stringify({user: obj.user, command: "ban_success", data: "Usuário banido com sucesso"}));
            usersWS[userToBanIndex].send(JSON.stringify({user: obj.user, command: "banned", data: {room: obj.data.room, rooms: rooms}}));
          } else{
            usersWS[userIndex].send(JSON.stringify({user: obj.user, command: "failed_ban", data: "Usuário não encontrado"}));
          }
        } else{
          usersWS[userIndex].send(JSON.stringify({user: obj.user, command: "failed_ban", data: "Você não tem permissão para banir."}));
        }
      }
      console.log(rooms);
    }
  });

  usersWS.push(ws);
  users.push({user: "user"+`${users.length}`, level: (((users.length+1)%2)!==0)?"common":"admnistrator"});

  ws.send(JSON.stringify({user: users[users.length - 1].user, command: 'create_user', data: ''}));
  ws.send(JSON.stringify({user: users[users.length - 1].user, command: 'list_rooms', data: rooms}));
});
