# Buzón privado — GitHub Pages + Firebase

## Qué hace

Una página web sencilla para dos personas que conocen una misma clave de conversación.
Los mensajes se guardan en Cloud Firestore y el acceso requiere autenticación anónima de Firebase.

IMPORTANTE:
- Esto NO es anonimato absoluto.
- No es cifrado de extremo a extremo.
- GitHub registra información técnica de las visitas a GitHub Pages.
- Firebase puede registrar información técnica y de seguridad.
- La clave de la conversación funciona como un secreto de acceso; no la publiques.
- No uses esta versión para información de alto riesgo.

## 1. Crear Firebase

1. Entra en https://firebase.google.com/
2. Crea un proyecto.
3. Añade una aplicación Web.
4. Copia el objeto `firebaseConfig`.
5. En Authentication > Sign-in method, habilita "Anonymous".
6. Crea Firestore Database.
7. En Firestore > Rules, pega el contenido de `firestore.rules` y publícalo.

## 2. Configurar el código

Abre `app.js` y reemplaza el bloque:

const firebaseConfig = {
  ...
};

por el objeto que te entrega Firebase.

No pongas contraseñas privadas, claves de administrador ni service-account keys en el código.

## 3. Subir a GitHub

Crea un repositorio nuevo. En GitHub Free, GitHub Pages requiere que el repositorio sea público.

Sube:
- index.html
- style.css
- app.js
- firestore.rules
- README.md

Después ve a Settings > Pages y selecciona:
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)

GitHub publicará el sitio.

## 4. Crear una conversación

Abre la web y usa una clave larga, por ejemplo:

Luna_7R4_puerta_92

No uses nombres, teléfonos, fechas de nacimiento ni datos fáciles de adivinar.

Comparte con la otra persona la URL completa que aparecerá con `#clave`.

Ejemplo:

https://TUUSUARIO.github.io/TUREPO/#Luna_7R4_puerta_92

## 5. Recomendación de seguridad

Para una segunda versión conviene:
- cifrar el contenido antes de enviarlo a Firestore con AES-GCM;
- añadir caducidad y borrado automático;
- permitir imágenes cifradas;
- separar la clave de acceso de la clave de cifrado;
- evitar que los mensajes puedan ser enumerados o descubiertos;
- añadir un mecanismo de rotación de claves.

La versión actual prioriza simplicidad y facilidad de instalación.
