import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroDualPhones({
  splashScreenshot,
  homeScreenshot,
  height = 600,
  accent = "#1D61E7",
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(4, 6, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(new THREE.Color(accent), 1.0); rim.position.set(-6, 2, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-3, -4, 5); scene.add(fill);

    const W = 3.1, H = 6.4, D = 0.4, R = 0.5;

    function roundedBoxGeo(w, h, d, r, seg = 6) {
      const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      const g = new THREE.ExtrudeGeometry(s, {
        depth: d, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1,
        bevelSegments: seg, curveSegments: 24,
      });
      g.translate(0, 0, -d / 2); g.computeVertexNormals(); return g;
    }

    function roundedScreenGeo(w, h, r) {
      const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      const g = new THREE.ShapeGeometry(s, 24);
      const pos = g.attributes.position, uv = [];
      for (let i = 0; i < pos.count; i++) {
        uv.push((pos.getX(i) - x) / w, (pos.getY(i) - y) / h);
      }
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      return g;
    }

    function placeholderTexture(label) {
      const c = document.createElement("canvas"); c.width = 512; c.height = 1080;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0, "#eef4fe"); g.addColorStop(1, "#ffffff");
      ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = accent; ctx.textAlign = "center";
      ctx.font = "bold 52px 'IBM Plex Sans', sans-serif";
      ctx.fillText(label || "TrustFund", c.width / 2, c.height / 2);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    }

    const disposables = [];

    function makePhone(src, label) {
      const grp = new THREE.Group();
      const bodyGeo = roundedBoxGeo(W, H, D, R);
      const body = new THREE.Mesh(bodyGeo,
        new THREE.MeshStandardMaterial({ color: 0x14161c, metalness: 0.9, roughness: 0.35 }));
      grp.add(body);

      const screenGeo = roundedScreenGeo(W - 0.3, H - 0.3, R - 0.12);
      const screenMat = new THREE.MeshBasicMaterial({ map: placeholderTexture(label) });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = D / 2 + 0.13; grp.add(screen);

      const back = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.45, H - 0.45),
        new THREE.MeshStandardMaterial({ color: 0x1b1e26, metalness: 0.6, roughness: 0.5 }));
      back.rotation.y = Math.PI; back.position.z = -(D / 2 + 0.13); grp.add(back);

      const cam = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32),
        new THREE.MeshStandardMaterial({ color: 0x0c0d11, metalness: 0.8, roughness: 0.3 }));
      cam.rotation.y = Math.PI; cam.position.set(W / 2 - 0.8, H / 2 - 0.9, -(D / 2 + 0.15)); grp.add(cam);

      if (src) {
        new THREE.TextureLoader().load(src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          
          const imgAspect = tex.image.width / tex.image.height;
          const screenAspect = (W - 0.3) / (H - 0.3);
          
          if (imgAspect > screenAspect) {
            // Image is wider than screen: crop sides
            const scale = screenAspect / imgAspect;
            tex.repeat.set(scale, 1);
            tex.offset.set((1 - scale) / 2, 0); 
          } else {
            // Image is taller than screen: crop bottom (align top)
            const scale = imgAspect / screenAspect;
            tex.repeat.set(1, scale);
            tex.offset.set(0, 1 - scale); 
          }
          
          screenMat.map = tex; 
          screenMat.needsUpdate = true;
        }, undefined, () => {});
      }

      disposables.push(bodyGeo, screenGeo);
      return grp;
    }

    const rig = new THREE.Group(); scene.add(rig);

    const phoneBack = makePhone(splashScreenshot, "TrustFund");
    phoneBack.position.set(-1.25, 0.3, -1.0);
    phoneBack.rotation.set(0.05, 0.15, -0.05);
    rig.add(phoneBack);

    const phoneFront = makePhone(homeScreenshot, "Home");
    phoneFront.position.set(1.25, -0.1, 0.8);
    phoneFront.rotation.set(0.05, -0.15, 0.05);
    rig.add(phoneFront);

    rig.scale.set(0.88, 0.88, 0.88);
    
    // Set static rig rotation (removed mouse parallax)
    rig.rotation.y = 0;
    rig.rotation.x = 0.05;

    const clock = new THREE.Clock();
    let raf;
    function tick() {
      const t = clock.getElapsedTime();
      if (!reduced) {
        rig.position.y = Math.sin(t * 1.05) * 0.1;
        phoneFront.position.y = -0.1 + Math.sin(t * 1.2 + 0.5) * 0.05;
        phoneBack.position.y = 0.3 + Math.sin(t * 0.9) * 0.05;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [splashScreenshot, homeScreenshot, accent]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height }}
      role="img"
      aria-label="Dua perangkat menampilkan aplikasi TrustFund"
    />
  );
}