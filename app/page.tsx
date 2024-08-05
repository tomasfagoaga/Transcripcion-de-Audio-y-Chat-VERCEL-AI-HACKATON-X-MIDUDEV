"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useChat } from 'ai/react';
import ChatBubble from '../components/ChatBubble';
import { useMediaQuery } from 'react-responsive';

interface TranscriptionResult {
  spanish_transcription?: string;
  spanish_word_count?: number;
  english_transcription?: string;
  english_word_count?: number;
  creation_date?: string;
}

export default function Home() {
  const [spanishResult, setSpanishResult] = useState<TranscriptionResult | null>(null);
  const [englishResult, setEnglishResult] = useState<TranscriptionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [firstMessageSent, setFirstMessageSent] = useState<boolean>(false);

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat();
  const [chatError, setChatError] = useState<string | null>(null);

  // Use useMediaQuery to detect mobile view
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [placeholder, setPlaceholder] = useState("Puedes chatear con tu asistente de comunicación luego de subir tu mensaje.");

  useEffect(() => {
    if (isMobile) {
      setPlaceholder("Placeholder para móvil");
    } else {
      setPlaceholder("Puedes chatear con tu asistente de comunicación luego de subir tu mensaje.");
    }
  }, [isMobile]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'error') {
      setChatError(messages[messages.length - 1].content);
    } else {
      setChatError(null);
    }

    if (!firstMessageSent && messages.length > 1) {
      setFirstMessageSent(true);
      const chatForm = document.querySelector('.chat-form');
      if (chatForm) {
        chatForm.classList.remove('not-visible');
      }
    }
  }, [messages, firstMessageSent]);

  const createPrompt = (result: TranscriptionResult) => {
    if (result.spanish_transcription) {
      return `
      **Objetivo: Tienes un conjunto de mensajes que fueron transcritos de audios provenientes de WhatsApp utilizando tecnología de reconocimiento de voz (speech-to-text). Estos mensajes pueden contener errores de gramática, puntuación y problemas de interpretación de alguna palabra o frases. El audio fue enviado por un argentino, por lo que puede contener modismos y expresiones locales. Tu tarea es reinterpretar y corregir cada mensaje, mejorando su estructura y claridad, manteniendo el idioma original, aunque puede presentar palabras mundanas que en vez de usarlas en español con el mismo signficado se usa en inglés **

      Instrucciones:

      1. **Estructuración inicial**: Primero, estructura el mensaje utilizando puntos y comas para obtener el sentido de cada oración. Identifica y extrae datos generales de la conversación que puedan ser útiles en los siguientes puntos.

      2. **Identificación de incoherencias**: Analiza si alguna oración no tiene sentido y busca que palabras hay que cambiar, y normalmente cuando erra en una palabra, erra en 2 o 3 seguidas. Identifica las palabras o frases que parecen fuera de contexto o sin sentido y rearmemoslas para que tengan sentido.

      3. **Corrección de incoherencias**: Revisa las oraciones que no tienen sentido y analiza las palabras que podrían ser reemplazadas. Considera la sonoridad de las palabras y reemplázalas con otras que den sentido a la oración y que se relacionen con el contexto general del texto y especialmente con esa oración. Utiliza la información de la oración anterior y siguiente para evaluar que la nueva corrección funcione coherentemente.

      4. **Verificación de contexto**: Revisa cada palabra y frase en el contexto de la oración completa y el mensaje global. Asegúrate de que todas las correcciones sean coherentes y lógicas dentro del contexto, teniendo en cuenta que el mensaje original proviene de un hablante argentino.

      5. **Revisión final**: Con todas las correcciones y análisis realizados, revisa el mensaje completo nuevamente. Asegúrate de que el mensaje sea 100% coherente y tenga sentido en su totalidad. Si no lo es, vuelve a realizar este bucle desde el punto 1 hasta que estés 95% satisfecho. Si hay alguna duda, indica las áreas problemáticas y el porcentaje de error.

      6. **Margen de error**: Asegúrate de que el mensaje final tenga un margen de error nulo antes de considerarlo listo para enviar, sino reprocesa el mensaje antes de enviarlo.

      IMPORTANTE: Si es el primer mensaje: RESPONDE CON ESTE FORMATO:  
      "- MENSAJE EN ESPAÑOL PROCESADO CON IA: RESPUESTA_AL_PROMPT-MENSAJE-PROCESADO.

      IMPORTANTE: LUEGO EN LAS PREGUNTAS, SOLO AYUDA.
      
      **INFORMACION RECIBIDA:**
      - mensaje en español: ${result.spanish_transcription}
      - Creado el: ${result.creation_date}.
      `;
    } else if (result.english_transcription) {
      return `
      **Objetivo: Tienes un conjunto de mensajes que fueron transcritos de audios provenientes de WhatsApp utilizando tecnología de reconocimiento de voz (speech-to-text). Estos mensajes pueden contener errores de gramática, puntuación y problemas de interpretación de alguna palabra o frases. El audio fue enviado por un argentino, por lo que puede contener modismos y expresiones locales. Tu tarea es reinterpretar y corregir cada mensaje, mejorando su estructura y claridad, manteniendo el idioma original, aunque puede presentar palabras mundanas que en vez de usarlas en español con el mismo signficado se usa en inglés **

      Instrucciones:

      1. **Estructuración inicial**: Primero, estructura el mensaje utilizando puntos y comas para obtener el sentido de cada oración. Identifica y extrae datos generales de la conversación que puedan ser útiles en los siguientes puntos.

      2. **Identificación de incoherencias**: Analiza si alguna oración no tiene sentido y busca que palabras hay que cambiar, y normalmente cuando erra en una palabra, erra en 2 o 3 seguidas. Identifica las palabras o frases que parecen fuera de contexto o sin sentido y rearmemoslas para que tengan sentido.

      3. **Corrección de incoherencias**: Revisa las oraciones que no tienen sentido y analiza las palabras que podrían ser reemplazadas. Considera la sonoridad de las palabras y reemplázalas con otras que den sentido a la oración y que se relacionen con el contexto general del texto y especialmente con esa oración. Utiliza la información de la oración anterior y siguiente para evaluar que la nueva corrección funcione coherentemente.

      4. **Verificación de contexto**: Revisa cada palabra y frase en el contexto de la oración completa y el mensaje global. Asegúrate de que todas las correcciones sean coherentes y lógicas dentro del contexto, teniendo en cuenta que el mensaje original proviene de un hablante argentino.

      5. **Revisión final**: Con todas las correcciones y análisis realizados, revisa el mensaje completo nuevamente. Asegúrate de que el mensaje sea 100% coherente y tenga sentido en su totalidad. Si no lo es, vuelve a realizar este bucle desde el punto 1 hasta que estés 95% satisfecho. Si hay alguna duda, indica las áreas problemáticas y el porcentaje de error.

      6. **Margen de error**: Asegúrate de que el mensaje final tenga un margen de error nulo antes de considerarlo listo para enviar, sino reprocesa el mensaje antes de enviarlo.

      IMPORTANTE: Si es el primer mensaje: RESPONDE CON ESTE FORMATO:  
      "- MENSAJE EN INGLES PROCESADO CON IA: RESPUESTA_AL_PROMPT-MENSAJE-PROCESADO.

      IMPORTANTE: LUEGO EN LAS PREGUNTAS, SOLO AYUDA.
      
      **INFORMACION RECIBIDA:**
      - mensaje en inglés: ${result.english_transcription}
      - Creado el: ${result.creation_date}.
      `;
    }
    return '';
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>, language: string) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/upload/${language}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const results: TranscriptionResult[] = await response.json();
      console.log('Received results:', results);

      if (results.length > 0) {
        const result = results[0];
        if (language === 'spanish') {
          setSpanishResult(result);
        } else if (language === 'english') {
          setEnglishResult(result);
        }

        const prompt = createPrompt(result);
        setInput(prompt);

        setTimeout(() => {
          const chatFormButton = document.getElementById('ai-button');
          if (chatFormButton) {
            chatFormButton.click();
          }
        }, 1000);
      } else {
        throw new Error('No transcription results received');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error al subir o procesar el archivo. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderTranscriptionResult = (result: TranscriptionResult | null, language: string) => {
    if (!result) return null;

    return (
      <div >
        <h3>Resultado de Transcripción en {language}</h3>
        {language === 'Spanish' && (
          <>
            <p className='pRespuesta'><strong>Transcripción en Español:</strong> {result.spanish_transcription}</p>
            <p><strong>Conteo de Palabras:</strong> {result.spanish_word_count}</p>
          </>
        )}
        {language === 'English' && (
          <>
            <p className='pRespuesta'><strong>Transcripción en Inglés:</strong> {result.english_transcription}</p>
            <p><strong>Conteo de Palabras:</strong> {result.english_word_count}</p>
          </>
        )}
        <p><strong>Fecha de Creación:</strong> {result.creation_date}</p>
      </div>
    );
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="container">
      <Head>
        <title>Transcripción de Audio y Chat - Asistente de comunicación IA</title>
      </Head>
      <div className="sidebar">
        <h2>Subir Archivos de Audio para Transcripción - wav, .mp3, .ogg, .opus</h2>
       
        <div id="formES" className="formDiv">
          <form onSubmit={(e) => handleUpload(e, 'spanish')} encType="multipart/form-data">
            <h3>Transcribir Audio en Español</h3>
            <input type="file" name="audioFiles" accept=".wav,.mp3,.ogg,.opus" multiple />
            <input type="submit" value="Subir y Transcribir" disabled={loading} />
          </form>
        </div>
        {renderTranscriptionResult(spanishResult, 'Spanish')}

        <div id="formEN" className="formDiv">
          <form onSubmit={(e) => handleUpload(e, 'english')} encType="multipart/form-data">
            <h3>Transcribir Audio en Inglés</h3>
            <input type="file" name="audioFiles" accept=".wav,.mp3,.ogg,.opus" multiple />
            <input type="submit" value="Subir y Transcribir" disabled={loading} />
          </form>
        </div>
        {renderTranscriptionResult(englishResult, 'English')}

        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
      </div>

      <div className="main">
        <header className="header">
          <h1>Transcripción de Audio y Chat - Asistente de comunicación IA</h1>
          <h3>VERCEL AI HACKATON X MIDUDEV - POR TOMAS FAGOAGA - 2024  </h3>
        </header>

        <section className="chat-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="margin-1">Chat</p>
            <button onClick={handleReset}>RESETEAR APLICACIÓN</button>
          </div>
          <div className="chat-container">
            {messages.map((m, index) => (
              <ChatBubble
                key={`message-${index}`} // Genera una clave única usando el índice
                id={`message-${index}`} // Genera un id único usando el índice
                role={m.role === 'user' ? 'Usuario' : 'IA'}
                content={m.content}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className={`chat-form ${firstMessageSent ? 'yes-visible' : 'not-visible'}`}>
            <button id="ai-button" type="submit">Enviar</button>
            <input
              className="input-placeholder p-2 border border-gray-300 rounded shadow-xl text-black"
              value={input}
              placeholder={placeholder}
              onChange={handleInputChange}
            />
          </form>

          {chatError && <p style={{ color: 'var(--error-color)' }}>{chatError}</p>}
          {chatError && chatError.includes('Too Many Requests') && (
            <p style={{ color: 'var(--error-color)' }}>Estás enviando demasiadas solicitudes. Por favor, espera un momento y vuelve a intentarlo.</p>
          )}
        </section>
      </div>
    </div>
  );
}
