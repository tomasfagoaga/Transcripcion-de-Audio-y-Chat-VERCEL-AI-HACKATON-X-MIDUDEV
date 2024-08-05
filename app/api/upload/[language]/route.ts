import { NextRequest, NextResponse } from 'next/server';
import { promises as fsPromises } from 'fs';
import { join, resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';

const { writeFile, readFile, access, unlink } = fsPromises;

// Ruta directa al ejecutable de ffmpeg y su package.json
const ffmpegPath = resolve(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');

// Configurar la ruta de FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

console.log(`Usando ffmpeg desde: ${ffmpegPath}`);

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('Manejando solicitud POST');
  const formData = await req.formData();
  const files = formData.getAll('audioFiles') as File[];
  const language = req.url.split('/').pop(); // Obtén el idioma de la URL

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No se subieron archivos' }, { status: 400 });
  }

  const uploadDir = resolve(process.cwd(), 'upload');
  console.log(`Directorio de carga: ${uploadDir}`);
  
  // Declarar explícitamente el tipo de transcriptions
  const transcriptions: string[] = [];

  for (const file of files) {
    const uniqueFileName = `${uuidv4()}_${file.name}`;
    const tempFilePath = join(uploadDir, uniqueFileName);
    const outputFileName = `${uuidv4()}`;
    const outputFilePath = join(uploadDir, `${outputFileName}.wav`);

    try {
      console.log(`Escribiendo archivo en ${tempFilePath}`);
      await writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));
      console.log(`Archivo escrito en ${tempFilePath}`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempFilePath)
          .toFormat('wav')
          .audioChannels(1)
          .audioFrequency(16000)
          .audioBitrate('16k')
          .on('end', async () => {
            try {
              console.log(`Archivo convertido a ${outputFilePath}`);
              
              const resultsPath = await transcribirAudio(outputFilePath, language);
              const transcriptionResults = await readTranscriptionResults(resultsPath);

              console.log(`Transcripción recibida: ${JSON.stringify(transcriptionResults)}`);
              
              transcriptions.push(transcriptionResults);

              // Limpieza de archivos temporales con reintento (excluyendo el archivo JSON)
              await Promise.all([
                retryDelete(tempFilePath),
                retryDelete(outputFilePath)
              ]);

              resolve();
            } catch (err) {
              console.error(`Error al procesar la transcripción: ${err.message}`);
              reject(err);
            }
          })
          .on('error', (err) => {
            console.error(`Error al convertir el archivo: ${err.message}`);
            reject(`Error al convertir el archivo: ${err.message}`);
          })
          .save(outputFilePath);
      });
    } catch (err) {
      console.error(`Error al procesar el archivo: ${err.message}`);
      // Continuamos con el siguiente archivo
    }
  }

  if (transcriptions.length === 0) {
    return NextResponse.json({ error: 'No se generaron transcripciones' }, { status: 500 });
  }

  console.log(`Transcripciones: ${JSON.stringify(transcriptions)}`);
  return NextResponse.json(transcriptions);
}

async function transcribirAudio(filePath: string, language: string): Promise<string> {
  console.log(`Iniciando transcripción para el archivo: ${filePath} en idioma: ${language}`);
  return new Promise<string>((resolve, reject) => {
    const pythonProcess = spawn('python', ['transcribe_vosk_hybrid.py', filePath, language]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`stdout: ${output.trim()}`);
      
      const match = output.match(/OUTPUT_FILE_PATH:(.*)/);
      if (match) {
        const resultFile = match[1].trim();
        console.log(`Ruta del archivo de resultados encontrada: ${resultFile}`);
        resolve(resultFile);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('error', (err) => {
      console.error(`Error al ejecutar el script de Python: ${err.message}`);
      reject(`Error al ejecutar el script de Python: ${err.message}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Proceso de Python cerrado con código: ${code}`);
      if (code !== 0) {
        console.error(`El script terminó con código ${code}`);
        reject(`Error: El script terminó con código ${code}. Stderr: ${stderr}`);
      } else if (!stdout.includes('OUTPUT_FILE_PATH:')) {
        console.error('No se encontró la ruta del archivo de salida en la salida del script de Python');
        reject(`Error: No se encontró la ruta del archivo de salida. Stdout: ${stdout}`);
      }
    });
  });
}

async function readTranscriptionResults(filePath: string) {
  const jsonContent = await readFile(filePath, 'utf8');
  console.log(`Contenido JSON de la transcripción: ${jsonContent}`);
  return JSON.parse(jsonContent);
}

async function retryDelete(filePath: string, maxRetries = 5, delay = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await unlink(filePath);
      console.log(`Archivo eliminado exitosamente: ${filePath}`);
      return;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // El archivo no existe, consideramos que ya ha sido eliminado
        console.log(`Archivo ya no existe: ${filePath}`);
        return;
      }
      console.warn(`Intento ${i + 1} fallido para eliminar ${filePath}: ${error.message}`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`No se pudo eliminar el archivo después de ${maxRetries} intentos: ${filePath}`);
}
