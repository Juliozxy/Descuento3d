import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQUGfOQB5v49PqwujEDIEgbZIAuDJeEow",
  authDomain: "descuentos-c64eb.firebaseapp.com",
  projectId: "descuentos-c64eb",
  storageBucket: "descuentos-c64eb.firebasestorage.app",
  messagingSenderId: "631933876003",
  appId: "1:631933876003:web:acbc00c91befc61ded7e96"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
const loginPanel = $("loginPanel"), chatPanel = $("chatPanel"), statusEl = $("status");
const roomKeyInput = $("roomKey"), enterRoom = $("enterRoom"), loginError = $("loginError");
const messagesEl = $("messages"), form = $("messageForm"), input = $("messageInput");
const sendButton = $("sendButton"), counter = $("counter"), copyLink = $("copyLink");

let currentUser = null, roomId = null, unsubscribe = null;

function cleanRoomId(value) {
  return value.trim().replace(/[^A-Za-z0-9_-]/g, "").slice(0,64);
}
function urlRoom() { return cleanRoomId(decodeURIComponent(location.hash.replace(/^#/,""))); }
function formatDate(ts) {
  if (!ts) return "ahora";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("es-BO",{dateStyle:"short",timeStyle:"short"});
}
function renderMessage(data) {
  const box=document.createElement("article");
  box.className="message"+(data.uid===currentUser?.uid?" mine":"");
  const p=document.createElement("p"); p.textContent=data.text||"";
  const time=document.createElement("time"); time.textContent=formatDate(data.createdAt);
  box.append(p,time); return box;
}
function listenToRoom() {
  if(unsubscribe) unsubscribe();
  messagesEl.innerHTML="";
  const ref=collection(db,"rooms",roomId,"messages");
  const q=query(ref,orderBy("createdAt","asc"));
  unsubscribe=onSnapshot(q,snapshot=>{
    messagesEl.innerHTML="";
    snapshot.forEach(doc=>messagesEl.appendChild(renderMessage(doc.data())));
    messagesEl.scrollTop=messagesEl.scrollHeight;
  },error=>{
    console.error(error);
    loginError.textContent="No se pudieron leer los mensajes. Revisa las reglas de Firestore.";
  });
}
async function enter() {
  const key=cleanRoomId(roomKeyInput.value);
  if(key.length<8){loginError.textContent="Usa una clave de al menos 8 caracteres.";return;}
  if(!currentUser){loginError.textContent="Espera a que Firebase termine de conectar.";return;}
  roomId=key;
  history.replaceState(null,"","#"+encodeURIComponent(roomId));
  loginError.textContent="";
  loginPanel.classList.add("hidden"); chatPanel.classList.remove("hidden");
  statusEl.textContent="Conversación privada"; listenToRoom();
}
enterRoom.addEventListener("click",enter);
roomKeyInput.addEventListener("keydown",e=>{if(e.key==="Enter")enter();});
input.addEventListener("input",()=>counter.textContent=`${input.value.length}/2000`);

form.addEventListener("submit",async e=>{
  e.preventDefault(); const text=input.value.trim();
  if(!text||!roomId||!currentUser)return;
  sendButton.disabled=true;
  try{
    await addDoc(collection(db,"rooms",roomId,"messages"),{text,uid:currentUser.uid,createdAt:serverTimestamp()});
    input.value=""; counter.textContent="0/2000"; input.focus();
  }catch(error){console.error(error);alert("No se pudo enviar el mensaje.");}
  finally{sendButton.disabled=false;}
});

copyLink.addEventListener("click",async()=>{
  if(!roomId){alert("Primero entra a una conversación.");return;}
  try{
    await navigator.clipboard.writeText(location.href);
    copyLink.textContent="Enlace copiado";
    setTimeout(()=>copyLink.textContent="Copiar enlace",1500);
  }catch{alert("Copia manualmente la dirección de esta página.");}
});

onAuthStateChanged(auth,user=>{
  currentUser=user; statusEl.textContent=user?"Listo":"Conectando…";
  const r=urlRoom();
  if(r&&user){roomId=r;roomKeyInput.value=r;loginPanel.classList.add("hidden");chatPanel.classList.remove("hidden");statusEl.textContent="Conversación privada";listenToRoom();}
});
signInAnonymously(auth).catch(error=>{
  console.error(error); statusEl.textContent="Error de conexión";
  loginError.textContent="Activa Anonymous Authentication en Firebase.";
});
