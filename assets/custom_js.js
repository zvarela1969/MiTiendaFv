// document.addEventListener("DOMContentLoaded", () => {
//   const menu = document.querySelector(".shopify-section--header");
//   if (!menu) return;

//   const sentinel = document.createElement("div");
//   sentinel.setAttribute("aria-hidden", "true");
//   sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;opacity:0;";
//   document.body.prepend(sentinel);

//   const observer = new IntersectionObserver((entries) => {
//     const inView = entries[0].isIntersecting;
//     menu.classList.toggle("scrolled", !inView);
//   }, { threshold: 0 });

//   observer.observe(sentinel);

//   menu.classList.toggle("scrolled", window.scrollY > 0);
// });
