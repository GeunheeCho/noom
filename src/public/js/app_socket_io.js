//사용자를 서버쪽 socket.io와 자동으로 연결해 주는 함수
const socket = io();
const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");
const room = document.querySelector("#room");
const msgForm = room.querySelector("#msg");
const nameForm = room.querySelector("#name");    
const roomList = welcome.querySelector("ul");


room.hidden = true;
let roomName;

function showRoom(){
    welcome.hidden=true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    // room에 접속했을때 이벤트 리스너가 작동하도록
    nameForm.addEventListener("submit", handleNicknameSubmit);
    msgForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const input = room.querySelector("#msg input");
    message = input.value;
    socket.emit("send_message", message, roomName, ()=> addMessage(`You: ${message}`));
    input.value = "";
})
}

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleNicknameSubmit(e) {
    e.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value);    
    input.value = "";
    
}

welcome.addEventListener("submit",(e)=>{
    e.preventDefault();
    const input = welcome.querySelector("input");
    roomName = input.value;
    // 이벤트 이름(enter_room), 전송할 데이터(객체 전달 가능, 개수 제한 없음), 서버에서 호출할 콜백 함수
    socket.emit("enter_room", roomName, showRoom);    
    input.value = "";
})



socket.on("welcome",(userNickname, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${userNickname} arrived!`);
});
socket.on("message",(name, message)=>{
    addMessage(`${name}: ${message}`);
});

socket.on("bye",(userNickname, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${userNickname} left!`);
});
socket.on("room_change",(rooms)=>{
    roomList.innerHTML="";
    if(rooms.length == 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});