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
        ws.send(JSON.stringify({user: obj.user, command: "joined_room", data: tempRoom.room}));
      } else{
        ws.send(JSON.stringify({user: obj.user, command: "failed_to_join", 
                                data: "Ocorreu uma falha para entrar na sala"}));
      }

      console.log(rooms);
    }else if(obj.command === 'message'){
      const tempRoom = rooms.find((room) => room.room === obj.data.room);
      const indexes = users.map((user, index) => {
        if(tempRoom.participants.includes(user.user) && (user.user !== obj.user)){
          console.log("Aqui");
          return index;
        }
      });
      indexes.map((i) => {
        if(i!==undefined){
          usersWS[i].send(JSON.stringify({user: obj.user, command: "message", data: obj.data.message}))
        }
      });
    }
  });

  usersWS.push(ws);
  users.push({user: "user"+`${users.length}`, level: (((users.length+1)%2)!==0)?"common":"admnistrator"});

  ws.send(JSON.stringify({user: users[users.length - 1].user, command: 'create_user', data: ''}));
  ws.send(JSON.stringify({user: users[users.length - 1].user, command: 'list_rooms', data: rooms}));
});
