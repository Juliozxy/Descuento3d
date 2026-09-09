# Buzón privado V4 — cifrado en navegador

Esta versión cifra cada mensaje en el navegador con Web Crypto API usando AES-256-GCM.

- La clave nunca se coloca en la URL.
- La clave nunca se guarda en localStorage ni en Firestore.
- El nombre de la sala ya no es la clave: se usa SHA-256(clave).
- El mensaje se cifra antes de enviarse a Firestore.
- Firestore recibe `ciphertext`, `iv`, `uid` y fecha.
- Para descifrar, ambos dispositivos deben introducir exactamente la misma clave.
- Usa una clave de 16 caracteres como mínimo; se recomienda una clave larga y aleatoria.
- Si pierdes la clave, los mensajes cifrados no pueden recuperarse.
- Los mensajes antiguos de V3 no son compatibles con el nuevo identificador/cifrado.

IMPORTANTE: el JavaScript que se ejecuta en el navegador siempre puede inspeccionarse. Esta versión protege el contenido de los mensajes, no oculta el código.

Después de subir la V4, publica las reglas de `firestore.rules` en Firebase Console > Firestore Database > Rules.
