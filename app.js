import{initializeApp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import{getAuth,signInAnonymously,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import{getFirestore,collection,addDoc,query,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyBQUGfOQB5v49PqwujEDIEgbZIAuDJeEow",authDomain:"descuentos-c64eb.firebaseapp.com",projectId:"descuentos-c64eb",storageBucket:"descuentos-c64eb.firebasestorage.app",messagingSenderId:"631933876003",appId:"1:631933876003:web:acbc00c91befc61ded7e96"};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);
const loginPanel=$("loginPanel"),chatPanel=$("chatPanel"),roomKeyInput=$("roomKey"),enterRoom=$("enterRoom"),loginError=$("loginError"),messagesEl=$("messages"),form=$("messageForm"),input=$("messageInput"),sendButton=$("sendButton"),counter=$("counter"),copyLink=$("copyLink");
let currentUser=null,roomId=null,cryptoKey=null,unsubscribe=null;

function status(t){$("status").textContent=t;if($("statusChat"))$("statusChat").textContent=t}
function b64(bytes){let s="";for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s)}
function unb64(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
async function hash(text){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function derive(secret){
 const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),"PBKDF2",false,["deriveKey"]);
 return crypto.subtle.deriveKey({name:"PBKDF2",salt:new TextEncoder().encode("buzon-privado-v4-aes-gcm"),iterations:310000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encrypt(text){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const c=await crypto.subtle.encrypt({name:"AES-GCM",iv},cryptoKey,new TextEncoder().encode(text));
 return{ciphertext:b64(new Uint8Array(c)),iv:b64(iv)}
}
async function decrypt(c,iv){
 const p=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(iv)},cryptoKey,unb64(c));
 return new TextDecoder().decode(p)
}
function date(ts){if(!ts)return"ahora";const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleString("es-BO",{dateStyle:"short",timeStyle:"short"})}
async function render(data){
 const box=document.createElement("article");box.className="message"+(data.uid===currentUser?.uid?" mine":"");
 const p=document.createElement("p"),time=document.createElement("time");time.textContent=date(data.createdAt);
 try{p.textContent=data.ciphertext&&data.iv?await decrypt(data.ciphertext,data.iv):"[Mensaje antiguo no cifrado por V4]"}
 catch(e){console.error(e);p.textContent="[No se pudo descifrar este mensaje]"}
 box.append(p,time);return box
}
function listen(){
 if(unsubscribe)unsubscribe();messagesEl.innerHTML="";
 const ref=collection(db,"rooms",roomId,"messages");
 unsubscribe=onSnapshot(query(ref),async snap=>{
  const docs=[];snap.forEach(d=>docs.push({id:d.id,...d.data()}));
  docs.sort((a,b)=>(a.createdAt?.toMillis?a.createdAt.toMillis():0)-(b.createdAt?.toMillis?b.createdAt.toMillis():0));
  const nodes=await Promise.all(docs.map(render));messagesEl.innerHTML="";nodes.forEach(n=>messagesEl.appendChild(n));messagesEl.scrollTop=messagesEl.scrollHeight;
 },e=>{console.error(e);loginError.textContent="Error leyendo mensajes: "+(e.code||"revisa las reglas de Firestore")})
}
async function enter(){
 const secret=roomKeyInput.value.trim().slice(0,128);
 if(secret.length<16){loginError.textContent="Usa una clave de al menos 16 caracteres.";return}
 if(!currentUser){loginError.textContent="Espera a que Firebase termine de conectar.";return}
 enterRoom.disabled=true;loginError.textContent="";
 try{
  roomId=await hash(secret);cryptoKey=await derive(secret);
  history.replaceState(null,"",location.pathname+location.search);
  roomKeyInput.value="";loginPanel.classList.add("hidden");chatPanel.classList.remove("hidden");status("Conversación privada · cifrado activo");listen();input.focus()
 }catch(e){console.error(e);loginError.textContent="No se pudo preparar el cifrado."}
 finally{enterRoom.disabled=false}
}
enterRoom.addEventListener("click",enter);roomKeyInput.addEventListener("keydown",e=>{if(e.key==="Enter")enter()});
input.addEventListener("input",()=>counter.textContent=`${input.value.length}/2000`);
form.addEventListener("submit",async e=>{
 e.preventDefault();const text=input.value.trim();if(!text||!roomId||!cryptoKey||!currentUser)return;
 sendButton.disabled=true;
 try{const x=await encrypt(text);await addDoc(collection(db,"rooms",roomId,"messages"),{ciphertext:x.ciphertext,iv:x.iv,uid:currentUser.uid,createdAt:serverTimestamp()});input.value="";counter.textContent="0/2000";input.focus()}
 catch(e){console.error(e);alert("No se pudo enviar el mensaje: "+(e.code||"error desconocido"))}
 finally{sendButton.disabled=false}
});
copyLink.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(location.origin+location.pathname+location.search);copyLink.textContent="Enlace copiado";setTimeout(()=>copyLink.textContent="Copiar enlace",1500)}catch{alert("Copia manualmente la dirección de esta página.")}});
onAuthStateChanged(auth,u=>{currentUser=u;if(!u)status("Conectando…")});
signInAnonymously(auth).catch(e=>{console.error(e);status("Error de conexión");loginError.textContent="No se pudo iniciar la sesión anónima. Revisa Authentication > Anonymous."});
