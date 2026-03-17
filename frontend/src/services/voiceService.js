let recognitionInstance = null;
let synthInstance = null;

export function initVoice({ onResult, onError, onListeningChange }) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return { supported: false };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = true;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    onResult && onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError && onError(event);
    onListeningChange && onListeningChange(false);
  };

  recognition.onend = () => {
    onListeningChange && onListeningChange(false);
  };

  recognition.onspeechstart = () => {
    const synth = getSynth();
    if (synth && synth.speaking) {
      synth.cancel();
    }
  };

  recognitionInstance = recognition;

  return {
    supported: true,
  };
}

export function getSynth() {
  if (typeof window === 'undefined') return null;
  if (!synthInstance) {
    synthInstance = window.speechSynthesis || null;
  }
  return synthInstance;
}

export function startListening() {
  if (!recognitionInstance) return;
  try {
    recognitionInstance.start();
  } catch {
    // ignore
  }
}

export function stopListening() {
  if (!recognitionInstance) return;
  recognitionInstance.stop();
}

export function speakText(text, { onStart, onEnd } = {}) {
  const synth = getSynth();
  if (!synth) return;
  if (synth.speaking) {
    synth.cancel();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.onstart = () => {
    onStart && onStart();
  };
  utterance.onend = () => {
    onEnd && onEnd();
  };
  synth.speak(utterance);
}

export function stopSpeaking() {
  const synth = getSynth();
  if (synth && synth.speaking) {
    synth.cancel();
  }
}

