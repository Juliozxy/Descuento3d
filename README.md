# Panel independiente de limpieza de mensajes

Esta aplicación permite buscar y eliminar mensajes almacenados en:
rooms/{roomId}/messages

Actualmente está preparada para la versión SIN CIFRADO, donde cada mensaje tiene:
- text
- uid
- createdAt

## Antes de usarla

1. En Firebase Console abre Authentication > Sign-in method.
2. Habilita Email/Password.
3. Crea un usuario administrador con correo y una contraseña fuerte.
4. Abre Firestore Database > Rules.
5. Copia firestore.rules y reemplaza ADMIN_EMAIL por el correo exacto del administrador.
6. Publica las reglas.
7. Sube index.html, app.js y style.css a un sitio independiente (GitHub Pages, Cloudflare Pages, etc.).

## Importante sobre seguridad

NO uses una clave de administración escrita dentro de app.js. El panel usa Firebase Authentication y las reglas de Firestore autorizan el borrado únicamente al correo administrador configurado.

La aplicación NO muestra ni descifra el contenido de los mensajes. Solo consulta createdAt y elimina los documentos encontrados.

## Funcionamiento

- Introduce la misma clave de conversación que usa la aplicación principal.
- Selecciona "Eliminar mensajes desde".
- Pulsa Buscar mensajes.
- Revisa la cantidad encontrada.
- Confirma la eliminación.

Los borrados se ejecutan en lotes de hasta 450 documentos para evitar superar el límite de operaciones por batch.

## Nota

La clave de conversación se usa directamente como roomId, igual que en la aplicación actual analizada para este ZIP. Si posteriormente cambias a la versión V4 con roomId derivado por SHA-256, este panel deberá adaptarse.
