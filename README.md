# Buzón privado v2

Versión corregida para GitHub Pages + Firebase.

## Configuración Firebase
El `app.js` ya contiene el `firebaseConfig` proporcionado para el proyecto `descuentos-c64eb`.

Debe estar activado:
- Authentication > Sign-in method > Anonymous
- Firestore Database

En Firestore > Rules publicar el contenido de `firestore.rules`.

## GitHub Pages
Subir `index.html`, `style.css`, `app.js`, `firestore.rules` y `.nojekyll` al repositorio.
Luego:
Settings > Pages > Deploy from a branch > main > / (root).

## Importante
Esta versión corrige la lectura de mensajes. No es cifrado de extremo a extremo y no debe utilizarse para información de alto riesgo.
