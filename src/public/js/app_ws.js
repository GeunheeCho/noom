const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nick');
// 클라이언트에서 서버로 웹소켓을 이용해 연결
const socket = new WebSocket(`ws://${window.location.host}`);
console.log(window.location.host);

//msg JSON
// JSON을 문자열로 바꾸어 보내는 이유 : 웹소켓 프로토콜을 사용가능한 서버의 언어는 여러가지이고 호환성을 만족하기 위해
function makeMessage(type, payload){
    const msg = {type, payload};
    console.log(JSON.stringify(msg));
    return JSON.stringify(msg);
}


//연결되었을때
socket.addEventListener("open",()=>{
    console.log("Connected to Server");
})

//메시지 전달되었을때
socket.addEventListener("message",(message)=>{
    const messageli = `<li>${message.data}</li>`;
    messageList.insertAdjacentHTML("beforeend", messageli);
})
//연결 해제되었을때
socket.addEventListener("close", ()=>{
    console.log("Disconnected from Server");
})


// MessageForm
messageForm.addEventListener("submit",(event)=>{
    //이벤트 취소 메서드
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));    
    input.value="";
});

//NicknameForm
nickForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value="";
})

