// live clock
function updateTime() {
    const time = new Date();
    const hours = time.getHours().toString().padStart(2, "0");
    const mins = time.getMinutes().toString().padStart(2, "0");

    document.getElementById("liveTime").textContent = `${hours}:${mins}`;
}
setInterval(updateTime, 1000);
updateTime();


// menu switching highlight (future expansion)
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
    });
});

// attach events to the app cards (you can expand later)
document.querySelectorAll(".game-card").forEach(card => {
    card.addEventListener("click", () => {
        console.log("Open app:", card.innerText.trim());
    });
});
