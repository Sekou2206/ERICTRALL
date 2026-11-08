(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const desk = window.matchMedia("(min-width:861px)").matches;
  const hover = window.matchMedia("(hover:hover)").matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const year = $(".year");
  if (year) year.textContent = new Date().getFullYear();

  const quote = $("[data-words]");
  if (quote) quote.innerHTML = quote.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" ");

  const follow = $(".follow");
  const followImg = $(".follow img");
  if (follow && hover) {
    let x = 0, y = 0, fx = 0, fy = 0;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; });
    const loop = () => {
      fx += (x - fx) * .14; fy += (y - fy) * .14;
      const r = (x - fx) * .04;
      follow.style.transform = `translate(${fx + 26}px,${fy - follow.offsetHeight / 2}px) rotate(${Math.max(-8, Math.min(8, r))}deg)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$(".index__list li").forEach(li => {
      li.addEventListener("mouseenter", () => { followImg.src = li.dataset.img; follow.classList.add("is-on"); });
      li.addEventListener("mouseleave", () => follow.classList.remove("is-on"));
    });
  }

  if (desk) {
    let z = 10;
    $$(".sheet").forEach(sheet => {
      let sx = 0, sy = 0, ox = 0, oy = 0, drag = false;
      const rot = getComputedStyle(sheet).getPropertyValue("--r").trim() || "0deg";
      sheet.addEventListener("pointerdown", e => {
        drag = true; sheet.setPointerCapture(e.pointerId);
        sheet.classList.add("is-drag"); sheet.style.zIndex = ++z;
        sx = e.clientX - ox; sy = e.clientY - oy;
      });
      sheet.addEventListener("pointermove", e => {
        if (!drag) return;
        ox = e.clientX - sx; oy = e.clientY - sy;
        sheet.style.transform = `translate(${ox}px,${oy}px) rotate(calc(${rot} + ${(e.movementX || 0) * .4}deg)) scale(1.03)`;
      });
      const end = () => {
        if (!drag) return;
        drag = false; sheet.classList.remove("is-drag");
        sheet.style.transition = "transform .5s cubic-bezier(.16,1,.3,1),box-shadow .3s";
        sheet.style.transform = `translate(${ox}px,${oy}px) rotate(${rot})`;
        setTimeout(() => { sheet.style.transition = ""; }, 500);
      };
      sheet.addEventListener("pointerup", end);
      sheet.addEventListener("pointercancel", end);
    });
  }

  const loader = $(".loader");

  if (!hasGsap || reduce) {
    loader.remove();
    $$(".about__quote .w").forEach(w => w.style.opacity = 1);
    $$(".draw").forEach(p => p.style.strokeDashoffset = 0);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");

  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.stop();
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const t = $(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: "smooth" });
    });
  });

  gsap.set(".hero__eric>span,.hero__trall>span", { yPercent: 102 });
  gsap.set(".hero__fig img", { clipPath: "inset(0% 0% 100% 0%)" });
  gsap.set(".hand", { opacity: 0 });
  gsap.set(".hero__meta,.hero__plate,.hero__down", { opacity: 0, y: 10 });

  const count = $(".loader__count span");
  const c = { v: 0 };
  gsap.timeline({
    onComplete: () => {
      loader.remove();
      document.body.classList.remove("is-loading");
      lenis && lenis.start();
      ScrollTrigger.refresh();
    }
  })
    .to(".loader__scribble path", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
    .to(c, { v: 13, duration: 1.6, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(c.v)).padStart(2, "0"); } }, 0)
    .to(".loader", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "+=.15")
    .to(".hero__eric>span,.hero__trall>span", { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: .1 }, "-=.45")
    .to(".hero__fig img", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power3.inOut" }, "-=1.1")
    .to(".hero__meta,.hero__plate,.hero__down", { opacity: 1, y: 0, duration: .8, stagger: .08 }, "-=1")
    .to(".draw", { strokeDashoffset: 0, duration: .9, ease: "power2.inOut", stagger: .25 }, "-=.6")
    .to(".hand", { opacity: 1, duration: .5, stagger: .2 }, "-=.9");

  gsap.to(".hero__eric", { xPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__trall", { xPercent: 10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__fig", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  gsap.to(".about__quote .w", { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: ".about__quote", start: "top 80%", end: "bottom 50%", scrub: true } });
  gsap.from(".about__cols>*", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".about__cols", start: "top 85%" } });

  gsap.from(".index__list li", { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: .06, scrollTrigger: { trigger: ".index__list", start: "top 85%" } });

  if (desk) {
    const track = $(".trait__track");
    const now = $(".t-now");
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".trait", pin: ".trait__pin", start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true,
        onUpdate: s => { now.textContent = Math.min(4, Math.floor(s.progress * 4) + 1); }
      }
    });
    gsap.from(".sheet", {
      y: 120, opacity: 0, rotate: () => gsap.utils.random(-20, 20), duration: 1.4, ease: "expo.out", stagger: .08,
      scrollTrigger: { trigger: ".table__board", start: "top 80%" },
      clearProps: "transform,opacity"
    });
  } else {
    $$(".step").forEach(s => gsap.from(s, { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 85%" } }));
  }

  gsap.from(".commande__title", { y: 60, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".commande", start: "top 70%" } });
  gsap.from(".commande__grid>div", { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .1, scrollTrigger: { trigger: ".commande__grid", start: "top 85%" } });
  gsap.from(".foot__sign", { y: 80, opacity: 0, rotate: -10, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 90%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
