// Transport réseau : Firebase Realtime Database si configuré, sinon un mode local (onglets d’un même navigateur, pour tester).
{
const cfg = window.MK_FIREBASE || null;
const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('chargement impossible : ' + src)); document.head.appendChild(s); });
const FB = '10.12.2';

const NetFirebase = {
  kind: 'firebase',
  async init() {
    if (this.uid) return this.uid;
    for (const m of ['app', 'auth', 'database']) await loadScript(`https://www.gstatic.com/firebasejs/${FB}/firebase-${m}-compat.js`);
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION); // une identité par onglet
    await firebase.auth().signInAnonymously();
    this.db = firebase.database(); this.uid = firebase.auth().currentUser.uid; return this.uid;
  },
  set(path, v) { return this.db.ref(path).set(v); },
  async get(path) { const s = await this.db.ref(path).get(); return s.val(); },
  on(path, cb) { const r = this.db.ref(path); const h = (s) => cb(s.val()); r.on('value', h); return () => r.off('value', h); },
  remove(path) { return this.db.ref(path).remove(); },
};

const NetLocal = {
  kind: 'local', subs: [],
  async init() {
    if (this.uid) return this.uid;
    let id = sessionStorage.getItem('mk-uid'); if (!id) { id = 'u' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('mk-uid', id); }
    this.uid = id;
    addEventListener('storage', (e) => { if (e.key && e.key.startsWith('mk:')) this.fire(e.key.slice(3)); });
    return id;
  },
  read(path) {
    const v = localStorage.getItem('mk:' + path); if (v !== null) return JSON.parse(v);
    const pre = 'mk:' + path + '/', out = {}; let any = false;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pre)) { const rest = k.slice(pre.length); if (!rest.includes('/')) { out[rest] = JSON.parse(localStorage.getItem(k)); any = true; } } }
    return any ? out : null;
  },
  fire(path) { for (const s of this.subs) if (path === s.path || path.startsWith(s.path + '/') || s.path.startsWith(path + '/')) s.cb(this.read(s.path)); },
  async set(path, v) { if (v === null) localStorage.removeItem('mk:' + path); else localStorage.setItem('mk:' + path, JSON.stringify(v)); this.fire(path); },
  async get(path) { return this.read(path); },
  on(path, cb) { const s = { path, cb }; this.subs.push(s); setTimeout(() => cb(this.read(path)), 0); return () => { this.subs = this.subs.filter(x => x !== s); }; },
  async remove(path) { const pre = 'mk:' + path; for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k === pre || k.startsWith(pre + '/')) localStorage.removeItem(k); } this.fire(path); },
};

// identifiant de joueur propre à chaque onglet (distinct du compte anonyme Firebase)
const pid = (() => { try { let p = sessionStorage.getItem('mk-pid'); if (!p) { p = 'p' + Math.random().toString(36).slice(2, 12); sessionStorage.setItem('mk-pid', p); } return p; } catch (e) { return 'p' + Math.random().toString(36).slice(2, 12); } })();
const localMode = /[?&]local\b/.test(location.search);
window.MKNet = cfg && !localMode ? NetFirebase : (localMode ? NetLocal : null);
if (window.MKNet) window.MKNet.pid = pid;
}
