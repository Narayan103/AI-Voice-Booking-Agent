import React, { useEffect, useRef, useState } from 'react';
import MicIndicator from './MicIndicator.jsx';
import Transcript from './Transcript.jsx';
import { callAiAgent } from '../services/apiService.js';
import {
  initVoice,
  startListening,
  stopListening,
  speakText,
  stopSpeaking,
} from '../services/voiceService.js';

const SALON_NAME = 'Sunshine Salon';

const initialGreeting =
  'Hello, thank you for calling Sunshine Salon. This is your booking assistant. How may I help you today?';

const CallInterface = () => {
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | oncall | ended
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [bookingState, setBookingState] = useState({
    name: null,
    phone: null,
    date: null,
    time: null,
    people: null,
    step: 'idle',
  });
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [conversationStage, setConversationStage] = useState('idle'); // idle | greeting | intentDetection | booking_name | booking_phone | booking_date | booking_time | confirmation
  const [hasGreeted, setHasGreeted] = useState(false);
  const timerRef = useRef(null);
  const conversationRef = useRef('idle');
  const callActiveRef = useRef(false);
  const transcriptEndRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const debounceTimerRef = useRef(null);
  const bookingStateRef = useRef(bookingState);
  const conversationHistoryRef = useRef(conversationHistory);

  useEffect(() => {
    bookingStateRef.current = bookingState;
  }, [bookingState]);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  useEffect(() => {
    const { supported } = initVoice({
      onResult: handleRecognitionResult,
      onError: () => {},
      onListeningChange: (isListening) => {
        setListening(isListening);
      },
    });
    if (!supported) {
      setVoiceSupported(false);
    }
  }, []);

  useEffect(() => {
    conversationRef.current = conversationStage;
  }, [conversationStage]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (callStatus === 'oncall') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (callStatus === 'idle') {
        setCallDuration(0);
      }
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  const startCall = () => {
    if (!voiceSupported || callStatus === 'oncall') return;
    callActiveRef.current = true;
    setMessages([]);
    setCallStatus('oncall');
    setCallDuration(0);
    setConversationStage('greeting');
    setHasGreeted(false);
    setConversationHistory([]);
    setBookingState({
      name: null,
      phone: null,
      date: null,
      time: null,
      people: null,
      step: 'ask_name',
    });
    lastTranscriptRef.current = '';

    if (!hasGreeted) {
      setHasGreeted(true);
      addMessage('agent', initialGreeting);
      setConversationHistory((prev) => [
        ...prev,
        { role: 'assistant', content: initialGreeting },
      ]);
      speakText(initialGreeting, {
        onStart: () => {
          stopListening();
        },
        onEnd: () => {
          if (callActiveRef.current) {
            setConversationStage('intentDetection');
            startListening();
          }
        },
      });
    } else {
      setConversationStage('intentDetection');
      startListening();
    }
  };

  const endCall = () => {
    callActiveRef.current = false;
    setCallStatus('ended');
    setConversationStage('idle');
    setHasGreeted(false);
    lastTranscriptRef.current = '';
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setMessages([]);
    setConversationHistory([]);
    setBookingState({
      name: null,
      phone: null,
      date: null,
      time: null,
      people: null,
      step: 'idle',
    });
    stopListening();
    stopSpeaking();
    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
    }, 1000);
  };

  const handleUserSpeech = (text) => {
    if (!callActiveRef.current) return;
    const cleaned = text.trim();
    if (!cleaned) return;

    addMessage('user', cleaned);
    setConversationHistory((prev) => [
      ...prev,
      { role: 'user', content: cleaned },
    ]);
    sendToAi(cleaned);
  };

  const handleRecognitionResult = (rawText) => {
    if (!callActiveRef.current) return;
    const transcript = (rawText || '').trim();
    if (!transcript || transcript.length < 3) return;
    if (transcript === lastTranscriptRef.current) return;
    lastTranscriptRef.current = transcript;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      handleUserSpeech(transcript);
    }, 350);
  };

  const respond = (text, options = {}) => {
    const { nextStage } = options;
    addMessage('agent', text);
    speakText(text, {
      onStart: () => {
        stopListening();
      },
      onEnd: () => {
        if (callActiveRef.current) {
          startListening();
        }
        if (nextStage) {
          setConversationStage(nextStage);
        }
      },
    });
  };

  const sendToAi = async (userText) => {
    try {
      const { ok, data } = await callAiAgent(
        userText,
        conversationHistoryRef.current,
        bookingStateRef.current
      );
      if (!ok) {
        respond(
          'Sorry, I had trouble connecting to our assistant. Please try again in a moment.'
        );
        return;
      }

      const replyText = data.reply || '';
      if (data.bookingState) {
        setBookingState(data.bookingState);
      }
      if (replyText) {
        addMessage('agent', replyText);
        setConversationHistory((prev) => [
          ...prev,
          { role: 'assistant', content: replyText },
        ]);
        speakText(replyText, {
          onStart: () => {
            stopListening();
          },
          onEnd: () => {
            if (callActiveRef.current) {
              startListening();
            }
          },
        });
      }
    } catch (err) {
      respond(
        'Sorry, there was a problem talking to our assistant. Please try again shortly.'
      );
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-md w-full mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl shadow-black/50 backdrop-blur-xl flex flex-col overflow-hidden">
      <header className="px-6 py-5 border-b border-slate-800 flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center">
          <span className="text-emerald-400 font-semibold text-lg">SS</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-50">{SALON_NAME}</h1>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              callStatus === 'oncall' ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          />
          <span className="capitalize">
            {callStatus === 'idle'
              ? 'Idle'
              : callStatus === 'oncall'
              ? 'On Call'
              : callStatus === 'ended'
              ? 'Call Ended'
              : 'Calling'}
          </span>
          {callStatus === 'oncall' && (
            <span className="text-slate-300">• {formatDuration(callDuration)}</span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-4 pb-2">
        <Transcript messages={messages} />
        <div ref={transcriptEndRef} />
        <div className="mt-4 flex items-center justify-between">
          <MicIndicator active={callStatus === 'oncall' && listening} />
          {!voiceSupported && (
            <p className="text-[11px] text-rose-400 max-w-[160px] text-right">
              Voice is not supported in this browser. Please use a recent version
              of Chrome or Edge.
            </p>
          )}
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-slate-800 flex items-center justify-center gap-6">
        {callStatus !== 'oncall' ? (
          <button
            type="button"
            onClick={startCall}
            disabled={!voiceSupported}
            className="inline-flex items-center justify-center h-12 w-28 rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold shadow-lg shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Call
          </button>
        ) : (
          <button
            type="button"
            onClick={endCall}
            className="inline-flex items-center justify-center h-12 w-28 rounded-full bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/40"
          >
            End Call
          </button>
        )}
      </footer>
    </div>
  );
};

export default CallInterface;

