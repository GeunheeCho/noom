import http from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";


const app = express();
//__dirname = 현재 폴더 경로를 나타내는 기본 전역변수
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
//app.use를 사용해야 public폴더를 사용가능
app.use("/public", express.static(__dirname + "/public"));
//라우팅 home.pug
app.get("/", (req, res)=> res.render("home"));
// app.get("(.*)", (req, res) => res.redirect("/"));

// 웹소켓 프로토콜을 추가하기 위해 listen 대신 createServer 사용, 하나의 포트에서 모두 사용하기 위해
//http 서버에 ws 기능 추가
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["htpps://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

//public room의 이름 찾기
function publicRooms() {
    const {
        sockets:{ 
            adapter: {sids, rooms}, //구조분해할당
        },
    } = wsServer;
    const publicRooms =[];
    rooms.forEach((_, key)=>{
        if(sids.get(key) == undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms;
}
function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection", (socket)=>{
    socket["nickname"]="Anonymous";
    //콜백함수는 emit의 마지막 argument로
    // 프론트에서 정의된 콜백함수를 서버에서 호출(서버에서 실행 x)
    socket.on("enter_room", (roomName, done)=>{
        done();        
        //채팅룸 접속 메서드, 디폴트로 각 id와 같은 private room에 접속중
        // 방 이름이 존재 하면 존재하는 방에 합류, 없으면 생성
        //socket.leave()도 가능
        socket.join(roomName);
        // to 메서드 - 이벤트를 통해 데이터를 전달하고 싶은 대상을 지정할 수 있음(본인 제외)
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());//서버와 연결된 모든 소켓에 이벤트 생성
        // console.log(`socket id = ${socket.id}`);
    });

    socket.on("nickname", (name)=>{
        socket["nickname"]=name;
    })

    socket.on("send_message", (message, roomName, done)=>{ 
    //다른 연결된 사람들에게 message 이벤트 발생    
        socket.to(roomName).emit("message", socket.nickname, message);
        //본인 프론트엔드 함수 실행
        done();        
    });
    socket.on("disconnecting",()=>{
        socket.rooms.forEach(room => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1);
        });
    })
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    })
})



const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);