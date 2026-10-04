// The homepage's cinematic entrance: two black panels meeting on a glowing
// "/" seam split open to reveal the page. It's pure CSS, so it always opens
// even if scripts fail. introScript (in <head>) decides before first paint
// whether it plays: only on the homepage, on every fresh load of it, and never for
// people who ask their device for reduced motion.

export const introScript = `(function(){try{
var d=document.documentElement;
if(location.pathname!=="/")return;
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(sessionStorage.getItem("kep-intro"))return; /* tests and previews can skip it */
d.classList.add("intro-play");
}catch(e){}})();`;

export function IntroCurtain() {
  return (
    <div aria-hidden="true" className="kep-intro">
      <div className="kep-intro-panel kep-intro-a" />
      <div className="kep-intro-panel kep-intro-b" />
      <svg className="kep-intro-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="40" y1="100" x2="60" y2="0" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
