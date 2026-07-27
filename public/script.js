const socket = io({
	withCredentials : true
});

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

// Create button
const btn = document.createElement("button");
btn.id = "scroll-btn";
btn.innerHTML = "⬇";
btn.setAttribute("aria-label", "Scroll to bottom");
document.body.appendChild(btn);

const endPoint = document.getElementById("end-point");

btn.addEventListener("click", () => {
  endPoint.scrollIntoView({ behavior: "smooth" });
});

// Observer to hide/show button
const observer = new IntersectionObserver(([entry]) => {
  btn.classList.toggle("hidden", entry.isIntersecting);
}, { threshold: 0.1 });

observer.observe(endPoint);

// Main work
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
