const options = { threshold: 0.5 };
let intersectionObserver;

const initIntersectionObserver = () => {
  if (intersectionObserver) return;

  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const eventName = entry.isIntersecting ? 'inViewport' : 'outViewport';
      entry.target.dispatchEvent(new CustomEvent(eventName));
    });
  }, options);
}

export const intersect = (node) =>{
  initIntersectionObserver();

  intersectionObserver.observe(node);

  return {
    destroy() {
      intersectionObserver.unobserve(node);
    }
  }
}