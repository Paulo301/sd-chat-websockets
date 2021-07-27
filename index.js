const ws = require('ws');

const wss = new ws.Server({ port: 8080 });

const users = [];
const usersWS = [];
let rooms = [{room: "sala_geral", participants: []}];


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const obj = JSON.parse(data);

    if(obj.command === 'join'){
      const tempRoom = rooms.find((room) => room.room === obj.data);
      tempRoom.participants.push(obj.user);
      if(tempRoom !== undefined){
        rooms = rooms.map((room) => {
          if(room.room === tempRoom.room){
            return tempRoom;
          }else{
            return room;
          }
        });
        ws.send({user: obj.user, command: "joined_room", data: tempRoom.room});
      } else{
        ws.send({user: obj.user, command: "failed_to_join", data: "Ocorreu uma falha para entrar na sala"});
      }
    }
  });

  usersWS.push(ws);
  users.push({user: "user"+`${users.length}`, level: (((users.length+1)%2)!==0)?"common":"admnistrator"});

  ws.send(JSON.stringify({user: users[users.length - 1].user, command: 'create_user', data: ''}));
  ws.send(JSON.stringify({user: users[users.length - 1].user, command: 'list_rooms', data: rooms}));
});
