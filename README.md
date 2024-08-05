--------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------


VERCEL AI HACKATON X MIDUDEV - POR TOMAS FAGOAGA - 2024  
Transcripción de Audio y Chat - Asistente de comunicación IA

Introducción
La aplicación web desarrollada tiene como objetivo la transcripción de archivos de audio a texto y la posterior reestructuración y mejora del mensaje utilizando inteligencia artificial. 
La integración de Vosk para la transcripción y OpenAI para la reconstrucción del mensaje, junto con la infraestructura de Vercel AI, proporciona una plataforma robusta y escalable. 
La capacidad de procesar múltiples audios y la asistencia por chatbot destacan la versatilidad y utilidad de la aplicación en el manejo diario de comunicaciones por audio, mejorando significativamente la eficiencia y productividad de los usuarios. 
Idiomas Español e inglés.
Escalabilidad:  Potencialidad de agregar más de 10 idiomas gracias a Vosk, y sus modelos.

**PARA HACER EL TEST**
El repositorio incluye dos archivos:  **Audio_Prueba_ESPANOL.mp3** y **Audio_Prueba_INGLES.mp3** para hacer la prueba.




--------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------

Arquitectura del Sistema
Frontend: Implementado con Next.js y React.
Backend: Utiliza API routes de Next.js con procesamiento adicional mediante scripts de Python.
Almacenamiento y Manipulación de Archivos: Manejado con multer y fluent-ffmpeg.
Transcripción de Audio: Utiliza el modelo Vosk.
Reconstrucción del Mensaje: Interacción con la API de OpenAI a través de Vercel AI para dar sentido al mensaje transcrito.
Asistencia por Chatbot: Interacción adicional con el chatbot para consultar información del texto o solicitar asistencia adicional.
Detalles de Implementación
Procesamiento de Audio
El procesamiento de audio es un componente crítico de la aplicación, ya que asegura que los archivos de audio sean convertidos a un formato adecuado para la transcripción utilizando el modelo Vosk. Aquí se describen los pasos detallados del proceso:

Carga de Archivos: Los archivos de audio se cargan a través del frontend y se envían al backend utilizando formularios multipart.
Conversión de Formato: Utilizando fluent-ffmpeg, los archivos de audio se convierten al formato WAV con las especificaciones necesarias (mono, PCM a 16 kHz). Esta conversión es crucial ya que Vosk requiere archivos de audio en este formato específico para funcionar correctamente.
Almacenamiento Temporal: Los archivos convertidos se almacenan temporalmente en el servidor para su procesamiento posterior.
Transcripción de Audio con Vosk
El script transcribe_vosk_hybrid.py utiliza el modelo Vosk para transcribir el audio. Vosk es un motor de reconocimiento de voz de código abierto que soporta múltiples idiomas. El script realiza las siguientes funciones:

Carga del Modelo: Dependiendo del idioma seleccionado, se carga el modelo Vosk correspondiente.
Transcripción: El audio se procesa en fragmentos, y el texto transcrito se acumula y devuelve al final del proceso.
Reconstrucción del Mensaje con OpenAI
Una vez transcrito el audio, el siguiente paso es reconstruir y dar sentido al mensaje utilizando la API de OpenAI. Esto es crucial, ya que la transcripción realizada por Vosk traduce el audio palabra por palabra, lo que puede llevar a errores y falta de coherencia en el mensaje. La capa de inteligencia artificial de OpenAI se encarga de:

Corrección de Errores: Identifica y corrige errores en la transcripción.
Reestructuración del Mensaje: Reorganiza las palabras y oraciones para asegurar que el mensaje tenga sentido y sea coherente.
Asistencia Adicional: Permite al usuario interactuar con un chatbot para consultar información del texto transcrito o solicitar cualquier tipo de asistencia adicional. Permiteprocesar en la misma conversación más de un audio (incluso de distintos lenguajes).
Interacción con la API de OpenAI
La interacción con la API de OpenAI se realiza a través de Vercel AI, que maneja las comunicaciones y asegura una integración eficiente y escalable. Este proceso incluye:

Configuración de OpenAI: Utilizando openai y ai para configurar la API y manejar respuestas en streaming.
Manejo de Retries: Implementación de lógica para manejar errores y reintentar solicitudes en caso de errores temporales como el código de estado 429 (Too Many Requests).
Seguridad y Manejo de Datos
Seguridad de Archivos: Los archivos de audio y los resultados de transcripción se almacenan temporalmente y se eliminan después de su procesamiento para asegurar que no se acumulen datos sensibles en el servidor.
Privacidad de los Datos: La aplicación asegura que los datos personales y las transcripciones se manejen de manera segura, cumpliendo con las normativas de privacidad aplicables.

-------------------------------------------------------------------
-------------------------------------------------------------------
-------------------------------------------------------------------

