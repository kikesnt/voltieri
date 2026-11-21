// Visor 3D procedural con las dimensiones reales del coche. Se carga solo cuando se abre.
(function(){
  let ready = null, scene, camera, renderer, car, frame, host = null;
  let az = 0.7, el = 0.45, dist = 9, dragging = false, lastX = 0, lastY = 0;

  function loadScript(src){
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function ensure(){
    if (!ready) ready = window.THREE ? Promise.resolve() : loadScript("https://unpkg.com/three@0.160.0/build/three.min.js");
    return ready;
  }

  function makeCar(c, garage){
    const T = window.THREE;
    const g = new T.Group();
    const L = (c.len || 4700) / 1000, W = (c.wid || 1850) / 1000, H = (c.hei || 1450) / 1000;
    const paint = new T.MeshStandardMaterial({ color:0x8fb0ff, metalness:.25, roughness:.55 });
    const glass = new T.MeshStandardMaterial({ color:0x14202c, metalness:.4, roughness:.25 });
    const rubber = new T.MeshStandardMaterial({ color:0x1a1a18, roughness:.9 });
    const body = new T.Mesh(new T.BoxGeometry(L, H*.44, W), paint);
    body.position.y = H*.42; g.add(body);
    const cabin = new T.Mesh(new T.BoxGeometry(L*.54, H*.36, W*.9), glass);
    cabin.position.set(-L*.04, H*.79, 0); g.add(cabin);
    for (const x of [-L*.33, L*.33]) for (const z of [-W*.53, W*.53]) {
      const wheel = new T.Mesh(new T.CylinderGeometry(H*.17, H*.17, W*.13, 20), rubber);
      wheel.rotation.x = Math.PI/2;
      wheel.position.set(x, H*.18, z); g.add(wheel);
    }
    if (garage) {
      const floor = new T.Mesh(new T.PlaneGeometry(6, 3.2), new T.MeshBasicMaterial({ color:0xe7dcc6, side:T.DoubleSide }));
      floor.rotation.x = -Math.PI/2; floor.position.y = -0.01; g.add(floor);
      const lines = new T.LineSegments(
        new T.EdgesGeometry(new T.PlaneGeometry(5, 2.5)),
        new T.LineBasicMaterial({ color:0xc4441e })
      );
      lines.rotation.x = -Math.PI/2; lines.position.y = 0.01; g.add(lines);
    }
    return g;
  }

  function render(){
    if (!renderer || !host) return;
    camera.position.set(Math.sin(az)*Math.cos(el)*dist, Math.sin(el)*dist, Math.cos(az)*Math.cos(el)*dist);
    camera.lookAt(0, 0.6, 0);
    renderer.render(scene, camera);
  }

  function mount(t, container){
    host = container;
    if (frame) cancelAnimationFrame(frame);
    ensure().then(() => {
      if (host !== container) return;
      while (container.firstChild) container.removeChild(container.firstChild);
      container.style.height = "340px";
      container.style.border = "1px solid var(--rule)";
      scene = new window.THREE.Scene();
      scene.background = new window.THREE.Color(0xf2eada);
      camera = new window.THREE.PerspectiveCamera(42, Math.max(1, container.clientWidth)/340, 0.1, 100);
      renderer = new window.THREE.WebGLRenderer({ antialias:true });
      renderer.setSize(container.clientWidth, 340);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      scene.add(new window.THREE.AmbientLight(0xffffff, .75));
      const light = new window.THREE.DirectionalLight(0xffffff, 1.1);
      light.position.set(5, 9, 4); scene.add(light);
      car = makeCar(CARS[t.inputs ? (t.inputs[0].value || Object.keys(CARS)[0]) : Object.keys(CARS)[0]], t.id === "garaje");
      scene.add(car);
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; lastY = e.clientY; renderer.domElement.style.cursor = "grabbing"; });
      window.addEventListener("pointerup", () => { dragging = false; if (renderer) renderer.domElement.style.cursor = "grab"; });
      window.addEventListener("pointermove", e => {
        if (!dragging) return;
        az -= (e.clientX - lastX) * .01;
        el = Math.max(.08, Math.min(1.3, el + (e.clientY - lastY) * .006));
        lastX = e.clientX; lastY = e.clientY; render();
      });
      render();
    }).catch(() => {
      container.innerHTML = '<p class="source">No se pudo cargar el visor 3D. Comprueba la conexión.</p>';
    });
  }

  window.__afterRender = function(t){
    const hostEl = document.getElementById("car3d");
    if (hostEl && (t.id === "360" || t.id === "garaje")) mount(t, hostEl);
  };
})();
