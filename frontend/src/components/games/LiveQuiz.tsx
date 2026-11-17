import React, { useEffect, useState } from 'react';
import { Copy, Radio, Trophy, Users } from 'lucide-react';
import { apiRequest } from '../../services/http';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

type QuizQuestion = { prompt: string; options: string[]; correct_index: number; seconds?: number };
type Room = { id: number; pin: string; title: string; status: 'lobby' | 'question' | 'finished'; current_question: number; question_count: number; question: QuizQuestion | null; players: { id: number; name: string; score: number; answered: boolean }[]; is_host: boolean };

const starterQuestions: QuizQuestion[] = [
  { prompt: 'Which word contains the long vowel /iː/?', options: ['Ship', 'Sheep', 'Chip', 'Dip'], correct_index: 1, seconds: 20 },
  { prompt: 'Which sound begins the word “think”?', options: ['/s/', '/t/', '/θ/', '/f/'], correct_index: 2, seconds: 20 },
];

export const LiveQuiz: React.FC = () => {
  const { user, token } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [pin, setPin] = useState('');
  const [title, setTitle] = useState('Phonetics challenge');
  const [questions, setQuestions] = useState<QuizQuestion[]>(starterQuestions);
  const [prompt, setPrompt] = useState('');
  const [optionsText, setOptionsText] = useState('Option A, Option B, Option C, Option D');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isTeacher = user?.role === 'teacher' || user?.role === 'super_admin';

  const request = <T,>(path: string, method = 'GET', body?: unknown) => apiRequest<T>(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) }, token);
  const refreshRoom = async (id: number) => {
    try {
      const updated = await request<Room>(`/games/live/${id}`);
      setRoom(updated);
      if (updated.status !== 'question') setAnswered(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to refresh game.'); }
  };

  useEffect(() => {
    if (!room) return;
    const timer = window.setInterval(() => void refreshRoom(room.id), 1200);
    return () => window.clearInterval(timer);
  }, [room?.id]);

  const run = async (action: () => Promise<Room>) => {
    setBusy(true); setMessage('');
    try { const nextRoom = await action(); setRoom(nextRoom); setAnswered(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Request failed.'); }
    finally { setBusy(false); }
  };

  const addQuestion = () => {
    const options = optionsText.split(',').map((value) => value.trim()).filter(Boolean);
    if (!prompt.trim() || options.length < 2 || correctIndex >= options.length) { setMessage('Enter a question and at least two options; choose a valid correct option.'); return; }
    setQuestions((current) => [...current, { prompt: prompt.trim(), options, correct_index: correctIndex, seconds: 20 }]);
    setPrompt(''); setMessage('Question added.');
  };

  const createGame = () => run(() => request<Room>('/games/live', 'POST', { title, questions }));
  const joinGame = () => run(async () => {
    const joined = await request<Room>('/games/live/join', 'POST', { pin });
    return joined;
  });

  const answer = async (choice: number) => {
    if (!room || answered !== null) return;
    setAnswered(choice);
    try { await request(`/games/live/${room.id}/answer`, 'POST', { answer: choice }); await refreshRoom(room.id); }
    catch (error) { setAnswered(null); setMessage(error instanceof Error ? error.message : 'Answer was not recorded.'); }
  };

  if (!room) return <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm sm:p-7">
    <div className="flex items-start gap-3"><span className="rounded-xl bg-indigo-600 p-2.5 text-white"><Radio className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-900">Live Quiz — play together</h2><p className="mt-1 text-sm text-slate-600">An instructor opens a room; students join with its six-digit PIN. Scores update live.</p></div></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      {isTeacher && <div className="rounded-xl border bg-white p-4"><h3 className="font-semibold">Host a live game</h3><label className="mt-3 block text-xs font-medium text-slate-600">Game title<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><div className="mt-3 rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-700">Add a question ({questions.length} ready)</p><input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question prompt" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder="Comma-separated answer choices" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" /><label className="mt-2 flex items-center gap-2 text-xs text-slate-600">Correct answer number (starting at 1)<input type="number" min={1} max={4} value={correctIndex + 1} onChange={(e) => setCorrectIndex(Math.max(0, Number(e.target.value) - 1))} className="w-20 rounded border px-2 py-1" /></label><button onClick={addQuestion} className="mt-2 text-sm font-semibold text-indigo-700">+ Add question</button></div><Button className="mt-3 w-full" disabled={busy || !title.trim()} onClick={() => void createGame()}>Create room & get PIN</Button></div>}
      <div className="rounded-xl border bg-white p-4"><h3 className="font-semibold">Join your teacher’s game</h3><p className="mt-1 text-xs text-slate-500">Enter the PIN shown on the classroom screen.</p><input aria-label="Game PIN" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit PIN" className="mt-4 w-full rounded-lg border px-3 py-3 text-center text-2xl font-bold tracking-[0.3em]" /><Button className="mt-3 w-full" disabled={busy || pin.length !== 6} onClick={() => void joinGame()}>Join game</Button></div>
    </div>
    {message && <p role="status" className="mt-3 text-sm text-indigo-800">{message}</p>}
  </section>;

  const question = room.question;
  const currentPlayer = room.players.find((player) => player.id === user?.id);
  return <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{room.is_host ? 'Teacher host' : 'Live game'}</p><h2 className="mt-1 text-xl font-bold">{room.title}</h2></div><div className="rounded-lg bg-indigo-50 px-4 py-2 text-center"><span className="block text-[10px] uppercase text-indigo-700">Join PIN</span><strong className="font-mono text-2xl tracking-widest text-indigo-900">{room.pin}</strong></div></div>
    {room.status === 'lobby' && <div className="mt-5 rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Waiting for players ({room.players.length})</div><p className="mt-2 text-sm text-slate-600">Share PIN <b>{room.pin}</b> with your class. Students sign into PHONETIX, open Games, and enter the PIN.</p><p className="mt-2 text-sm">{room.players.map((p) => p.name).join(' · ') || 'No students yet'}</p>{room.is_host && <Button className="mt-4" disabled={busy || room.players.length === 0} onClick={() => void run(() => request<Room>(`/games/live/${room.id}/start`, 'POST'))}>Start quiz</Button>}</div>}
    {room.status === 'question' && question && <div className="mt-5"><p className="text-xs font-semibold text-indigo-700">QUESTION {room.current_question + 1} / {room.question_count} · {room.players.filter((p) => p.answered).length}/{room.players.length} answered</p><h3 className="mt-3 text-center text-xl font-bold">{question.prompt}</h3>{!room.is_host ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{question.options.map((option, i) => <button key={i} disabled={answered !== null} onClick={() => void answer(i)} className={`min-h-20 rounded-xl border-2 p-4 text-left text-lg font-bold transition hover:scale-[1.01] disabled:opacity-70 ${answered === i ? 'border-indigo-600 bg-indigo-100 text-indigo-900' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'}`}>{option}</button>)}</div> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{question.options.map((option, i) => <div key={i} className={`rounded-xl p-4 font-semibold ${i === question.correct_index ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' : 'bg-slate-50 text-slate-600'}`}>{option}{i === question.correct_index && ' ✓'}</div>)}</div>}{!room.is_host && answered !== null && <p className="mt-3 text-center text-sm text-emerald-700">Answer received. Waiting for the teacher…</p>}{room.is_host && <Button className="mt-5" disabled={busy} onClick={() => void run(() => request<Room>(`/games/live/${room.id}/next`, 'POST'))}>{room.current_question + 1 === room.question_count ? 'Show final leaderboard' : 'Reveal answer & next question'}</Button>}</div>}
    {room.status === 'finished' && <div className="mt-5 rounded-xl bg-amber-50 p-4 text-center"><Trophy className="mx-auto h-8 w-8 text-amber-500" /><h3 className="mt-2 text-xl font-bold">Final leaderboard</h3></div>}
    <div className="mt-5 border-t pt-4"><h3 className="mb-2 text-sm font-semibold">Leaderboard</h3><ol className="grid gap-2 sm:grid-cols-2">{room.players.map((player, i) => <li key={player.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{i + 1}. {player.name} {player.answered && room.status === 'question' ? '✓' : ''}</span><b>{player.score}</b></li>)}</ol>{currentPlayer && <p className="mt-2 text-xs text-slate-500">Your score: {currentPlayer.score} points</p>}</div>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => void navigator.clipboard?.writeText(room.pin)} leftIcon={<Copy className="h-4 w-4" />}>Copy PIN</Button><Button variant="ghost" size="sm" onClick={() => { setRoom(null); setAnswered(null); setMessage(''); }}>Leave room</Button></div>
    {message && <p role="status" className="mt-3 text-sm text-rose-700">{message}</p>}
  </section>;
};
