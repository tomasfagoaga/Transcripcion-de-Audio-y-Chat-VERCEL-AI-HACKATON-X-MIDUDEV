import os
import sys
import wave
import json
from vosk import Model, KaldiRecognizer, SetLogLevel
from datetime import datetime

SetLogLevel(0)

if len(sys.argv) != 3:
    print("Uso: python transcribe_vosk_hybrid.py <archivo_de_audio> <idioma>")
    sys.exit(1)

audio_file = sys.argv[1]
language = sys.argv[2]

model_paths = {
    'spanish': os.path.abspath("models/vosk-model-small-es-0.42"),
    'english': os.path.abspath("models/vosk-model-small-en-us-0.15")
}

if language not in model_paths and language != 'mixed':
    print(f"Idioma no soportado: {language}")
    sys.exit(1)

def load_model(path):
    if not os.path.exists(path):
        print(f"Modelo no encontrado en la ruta: {path}")
        sys.exit(1)
    try:
        model = Model(path)
        return model
    except Exception as e:
        print(f"Error cargando el modelo: {e}")
        sys.exit(1)

def transcribe(model, wf):
    recognizer = KaldiRecognizer(model, wf.getframerate())
    transcription = ""
    
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            transcription += result.get("text", "") + " "
    final_result = json.loads(recognizer.FinalResult())
    transcription += final_result.get("text", "")
    return transcription.strip()

def get_creation_date(file_path):
    if os.name == 'nt':
        creation_time = os.path.getctime(file_path)
    else:
        stat = os.stat(file_path)
        creation_time = stat.st_birthtime if hasattr(stat, 'st_birthtime') else stat.st_mtime
    return datetime.fromtimestamp(creation_time).isoformat()

try:
    wf = wave.open(audio_file, "rb")
    
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        print("El archivo de audio debe estar en formato WAV mono PCM a 16 kHz.")
        sys.exit(1)
except Exception as e:
    print(f"Error abriendo el archivo de audio: {e}")
    sys.exit(1)

wf.rewind()

transcription_results = {}

if language == 'mixed':
    spanish_model = load_model(model_paths['spanish'])
    english_model = load_model(model_paths['english'])

    wf.rewind()
    spanish_transcription = transcribe(spanish_model, wf)
    spanish_word_count = len(spanish_transcription.split())

    wf.rewind()
    english_transcription = transcribe(english_model, wf)
    english_word_count = len(english_transcription.split())

    transcription_results = {
        "spanish_transcription": spanish_transcription,
        "spanish_word_count": spanish_word_count,
        "english_transcription": english_transcription,
        "english_word_count": english_word_count
    }
else:
    model = load_model(model_paths[language])
    transcription = transcribe(model, wf)
    word_count = len(transcription.split())

    transcription_results = {
        f"{language}_transcription": transcription,
        f"{language}_word_count": word_count
    }

creation_date = get_creation_date(audio_file)
transcription_results["creation_date"] = creation_date

output_file = os.path.splitext(audio_file)[0] + f"_{language}_transcription.json"
try:
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(transcription_results, f, ensure_ascii=False, indent=4)
    print(f"Resultados guardados en {output_file}")
    print(f"OUTPUT_FILE_PATH:{output_file}")
except Exception as e:
    print(f"Error guardando los resultados de la transcripción: {e}")
    sys.exit(1)
