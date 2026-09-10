import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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

const loginPanel=$('loginPanel'), adminPanel=$('adminPanel');
const email=$('email'), password=$('password'), loginButton=$('loginButton');
const roomKey=$('roomKey'), fromDate=$('fromDate'), findButton=$('findButton');
const result=$('result'), count=$('count'), rangeText=$('rangeText'), deleteArea=$('deleteArea');
const deleteButton=$('deleteButton'), statusEl=$('status'), loginError=$('loginError');
const logoutButton=$('logoutButton'), userStatus=$('userStatus');

let foundDocs=[];

function cleanRoomId(value){
  return value.trim().replace(/[^A-Za-z0-9_-]/g,'').slice(0,64);
}

function dateText(ts){
  const d=ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-BO',{dateStyle:'short',timeStyle:'short'});
}

loginButton.addEventListener('click', async()=>{
  loginError.textContent='';
  const e=email.value.trim(), p=password.value;
  if(!e||!p){loginError.textContent='Ingresa correo y contraseña.';return}
  loginButton.disabled=true;
  try{
    await signInWithEmailAndPassword(auth,e,p);
  }catch(err){
    console.error(err);
    loginError.textContent='No se pudo iniciar sesión. Verifica las credenciales.';
  }finally{loginButton.disabled=false}
});

password.addEventListener('keydown',e=>{if(e.key==='Enter')loginButton.click()});

onAuthStateChanged(auth,user=>{
  if(user){
    loginPanel.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    userStatus.textContent=`Administrador: ${user.email||'sesión activa'}`;
  }else{
    loginPanel.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    foundDocs=[];
  }
});

logoutButton.addEventListener('click',()=>signOut(auth));

findButton.addEventListener('click',async()=>{
  result.classList.add('hidden');
  deleteArea.classList.add('hidden');
  foundDocs=[];
  statusEl.textContent='';

  const key=cleanRoomId(roomKey.value);
  if(key.length<5){statusEl.textContent='La clave de conversación no es válida.';return}
  if(!fromDate.value){statusEl.textContent='Selecciona una fecha.';return}

  const start=new Date(`${fromDate.value}T00:00:00`);
  if(Number.isNaN(start.getTime())){statusEl.textContent='Fecha no válida.';return}

  findButton.disabled=true;
  findButton.textContent='Buscando...';
  try{
    const ref=collection(db,'rooms',key,'messages');
    const q=query(ref,where('createdAt','>=',Timestamp.fromDate(start)));
    const snap=await getDocs(q);
    snap.forEach(d=>foundDocs.push(d));

    foundDocs.sort((a,b)=>{
      const at=a.data().createdAt?.toMillis?.()||0;
      const bt=b.data().createdAt?.toMillis?.()||0;
      return at-bt;
    });

    count.textContent=foundDocs.length;
    rangeText.textContent=foundDocs.length ? `Desde ${fromDate.value}. Primer mensaje: ${dateText(foundDocs[0].data().createdAt)}.` : 'No se encontraron mensajes desde esa fecha.';
    result.classList.remove('hidden');
    if(foundDocs.length) deleteArea.classList.remove('hidden');
    statusEl.textContent='Búsqueda completada.';
  }catch(err){
    console.error(err);
    statusEl.textContent='Error al consultar Firestore: '+(err.code||'revisa las reglas de seguridad');
  }finally{
    findButton.disabled=false;
    findButton.textContent='Buscar mensajes';
  }
});

deleteButton.addEventListener('click',async()=>{
  if(!foundDocs.length)return;
  const total=foundDocs.length;
  if(!confirm(`¿Eliminar definitivamente ${total} mensajes?\n\nEsta operación no se puede deshacer.`))return;

  deleteButton.disabled=true;
  statusEl.textContent='Eliminando...';
  try{
    for(let i=0;i<foundDocs.length;i+=450){
      const batch=writeBatch(db);
      foundDocs.slice(i,i+450).forEach(d=>batch.delete(d.ref));
      await batch.commit();
    }
    foundDocs=[];
    count.textContent='0';
    rangeText.textContent='Los mensajes fueron eliminados correctamente.';
    deleteArea.classList.add('hidden');
    statusEl.textContent=`Se eliminaron ${total} mensajes.`;
  }catch(err){
    console.error(err);
    statusEl.textContent='Error durante la eliminación: '+(err.code||'revisa las reglas de seguridad');
  }finally{deleteButton.disabled=false}
});
