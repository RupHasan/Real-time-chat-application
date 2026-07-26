const socket = io();

// Autotype aka Marketing
const autotypeSpeed = 200;

let type = new Typed("#autoType", {
    strings: [
        "Programmer",
        "Student",
        "Web Developer",
        "Front-end Developer",
        "Back-end Developer",
        "Full-stack Developer"
    ],
    typeSpeed: autotypeSpeed,
    backSpeed: autotypeSpeed,
    loop: true
});

function escapeHtml(data) {
    const element = document.createElement("div");
    element.textContent = data;
    return element.innerHTML;
}

socket.on("onConnect", (data) => {
    //data format, [{},{},{},...]
    const container = document.getElementById("msg-container-main");
    container.innerHTML = "";
    data.forEach((item) => {
        container.innerHTML += `
        <div class="msg-container">
            <p class="username-container">${escapeHtml(item.username)}</p>
            <p class="msg-container-excluesive">${escapeHtml(item.msg)}</p>
        </div>
    `;
    });

});

function sendMsg() {
    const userMsg = document.getElementById("userMsgInput").value;
    socket.emit("sendMsg", userMsg)
    document.getElementById("userMsgInput").value = "";
}


socket.on("getMsg", (data)=>{
    const container = document.getElementById("msg-container-main");
    data.forEach((item) => {
        container.innerHTML += `
        <div class="msg-container">
            <p class="username-container">${escapeHtml(item.username)}</p>
            <p class="msg-container-excluesive">${escapeHtml(item.msg)}</p>
        </div>
    `;
    });
})