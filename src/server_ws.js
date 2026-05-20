import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express();
//__dirname = 현재 폴더 경로를 나타내는 기본 전역변수
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
//app.use를 사용해야 public폴더를 사용가능
app.use("/public", express.static(__dirname + "/public"));
//라우팅 home.pug
app.get("/", (req, res)=> res.render("home"));
// app.get("(.*)", (req, res) => res.redirect("/"));



// 웹소켓 프로토콜을 추가하기 위해 listen 대신 createServer 사용 하나의 포트에서 모두 사용하기 위해
const server = http.createServer(app);
// 서버에 웹소켓 프로토콜 추가 
const wss = new WebSocket.Server({server});
const sockets=[];

//socket - 연결과 그에 대한 정보
//WSS에 이벤트 리스너를 추가하는 것이 아닌 socket에 이벤트 리스너를 추가함
// on - 이벤트 리스너,  파라미터로 콜백함수 호출,
wss.on("connection", (socket)=>{
    sockets.push(socket);
    socket["nickname"]="Anonymous"
    console.log("Connected to Browser");
    socket.on("close",()=> console.log("Disconnected from Browser"));
    socket.on("message",(msg)=>{
        const message = JSON.parse(msg);
        switch (message.type) {
            case "nickname":
                socket["nickname"] = message.payload;
                break;
            case "new_message":
                // sockets 배열에 각각 socket정보(참여자 정보)를 넣고 forEach로 각 소켓에 메세지 전송
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}:${message.payload}`));   
                break;
            default:
                break;
        }
        
             
    })    
})

const handleListen = () => console.log("Listening on http://localhost:3000");
server.listen(3000, handleListen);