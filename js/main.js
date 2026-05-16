// simple interaction hooks

document.querySelector(".cta").addEventListener("click", () => {
  alert("Protocol Initiated");
});

// subtle hover feedback
document.querySelectorAll(".protocol").forEach(p => {
  p.addEventListener("mouseenter", () => {
    p.style.transform = "scale(1.05)";
  });
  p.addEventListener("mouseleave", () => {
    p.style.transform = "scale(1)";
  });
});
