import React, { useState } from 'react';
import { Bot, Mic, Send, Sparkles, Volume2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { speakPronunciation } from '../services/api';
import { AiChatMessage } from '../types';
import { apiRequest } from '../services/http';
import { useAuthStore } from '../store/authStore';

type SpeechRecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; onresult: ((event: { results: ArrayLike<SpeechRecognitionResult> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
const scenarios = ['Job interview', 'Class presentation', 'Ordering at a café', 'Asking for directions', 'Meeting a professor', 'Group project discussion'];
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const AiSpeakingPartner: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [level, setLevel] = useState<'A1' | 'B1' | 'C1'>('B1');
  const [topic, setTopic] = useState(scenarios[0]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([{ id: 'welcome', sender: 'ai_tutor', text: 'Choose a real-world scenario, then respond by typing or using speech input. I will prompt you to practise clear, complete spoken sentences.', timestamp: now() }]);
  const [rate, setRate] = useState(0.85);
  const [accent, setAccent] = useState('en-GB');

  const send = async (content = inputText) => {
    const message = content.trim(); if (!message || isResponding) return;
    setInputText(''); setError(''); setMessages((previous) => [...previous, { id: `local-${Date.now()}`, sender: 'student', text: message, timestamp: now() }]); setIsResponding(true);
    try {
      let id = conversationId;
      if (!id) { const created = await apiRequest<{ conversation: { id: number } }>('/ai/conversations', { method: 'POST', body: JSON.stringify({ topic, cefr_level: level }) }, token); id = created.conversation.id; setConversationId(id); }
      const reply = await apiRequest<{ reply: { text: string; pronunciation_notes?: string[] } }>(`/ai/conversations/${id}/message`, { method: 'POST', body: JSON.stringify({ message }) }, token);
      const text = reply.reply.text;
      setMessages((previous) => [...previous, { id: `reply-${Date.now()}`, sender: 'ai_tutor', text, timestamp: now(), pronunciationNotes: reply.reply.pronunciation_notes }]);
      speakPronunciation(text, undefined, { rate, lang: accent });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not continue this role-play.'); }
    finally { setIsResponding(false); }
  };

  const startSpeechInput = () => {
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) { setError('Speech recognition is not available in this browser. You can type your response instead.'); return; }
    const recognition = new Recognition(); recognition.lang = accent; recognition.interimResults = false;
    recognition.onresult = (event) => { const transcript = event.results[0]?.[0]?.transcript; if (transcript) void send(transcript); };
    recognition.onerror = () => setError('Speech input could not be heard. Please try again or type your response.');
    recognition.onend = () => setIsRecording(false);
    setError(''); setIsRecording(true); recognition.start();
  };

  return <div className="w-full space-y-6"><div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center"><div><Badge variant="success" size="sm">Guided speaking practice</Badge><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Real-world Speaking Practice</h1><p className="text-xs text-slate-500">Practise interviews, presentations, everyday conversations and academic speaking.</p></div><div className="flex items-center gap-2 text-xs">CEFR {(['A1', 'B1', 'C1'] as const).map((item) => <button key={item} onClick={() => setLevel(item)} className={`rounded px-3 py-1 font-bold ${level === item ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{item}</button>)}</div></div>
    {error && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}
    <div className="grid items-start gap-5 lg:grid-cols-3"><Card className="flex h-[620px] flex-col lg:col-span-2"><CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50"><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-emerald-600" /><div><CardTitle>Role-play conversation</CardTitle><span className="text-[10px] text-slate-400">{topic} · Level {level}</span></div></div><Badge variant="primary" size="sm">Practice mode</Badge><label className="sr-only" htmlFor="roleplay-scenario">Choose scenario</label><select id="roleplay-scenario" value={topic} onChange={(event) => { setTopic(event.target.value); setConversationId(null); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs">{scenarios.map((scenario) => <option key={scenario}>{scenario}</option>)}</select></CardHeader>
      <div aria-live="polite" aria-label="Conversation transcript" className="flex-1 space-y-4 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className={`flex flex-col ${message.sender === 'student' ? 'items-end' : 'items-start'}`}><div className={`max-w-[85%] space-y-2 rounded-xl p-4 text-sm leading-relaxed ${message.sender === 'student' ? 'rounded-tr-none bg-blue-600 text-white' : 'rounded-tl-none border border-slate-200 bg-slate-50 text-slate-800'}`}><p>{message.text}</p>{message.pronunciationNotes?.map((note) => <p key={note} className="border-t border-slate-200 pt-2 text-xs text-emerald-700"><Sparkles className="mr-1 inline h-3.5 w-3.5" />{note}</p>)}</div><span className="mt-1 px-1 text-[10px] text-slate-400">{message.timestamp}</span></div>)}{isResponding && <p role="status" className="text-xs text-slate-400">Preparing your practice prompt…</p>}</div>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 p-3"><Button variant={isRecording ? 'danger' : 'outline'} size="sm" onClick={startSpeechInput} disabled={isRecording || isResponding} leftIcon={<Mic className="h-4 w-4" />}>{isRecording ? 'Listening…' : 'Speak'}</Button><input aria-label="Your response" value={inputText} onChange={(event) => setInputText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void send(); }} placeholder="Type your response…" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" /><Button size="sm" onClick={() => void send()} disabled={!inputText.trim() || isResponding} leftIcon={<Send className="h-4 w-4" />}>Send</Button></div>
    </Card>
    <Card className="p-5"><h2 className="font-semibold text-slate-900">Accessible playback</h2><p className="mt-1 text-xs text-slate-500">Choose an accent and slower speech. Conversation text stays visible as captions.</p><div className="mt-4 space-y-3"><label className="block text-xs text-slate-600">Speech accent<select value={accent} onChange={(event) => setAccent(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-2"><option value="en-GB">UK English</option><option value="en-US">US English</option></select></label><label className="block text-xs text-slate-600">Playback speed: {rate.toFixed(2)}×<input aria-label="Speech playback speed" type="range" min="0.55" max="1.1" step="0.05" value={rate} onChange={(event) => setRate(Number(event.target.value))} className="mt-2 w-full" /></label></div><div className="mt-5 rounded-lg bg-blue-50 p-3 text-xs text-slate-700"><Volume2 className="mr-1 inline h-4 w-4 text-blue-600" />Try a response with a clear opening, stressed key words and a complete final sound.</div></Card></div>
  </div>;
};
