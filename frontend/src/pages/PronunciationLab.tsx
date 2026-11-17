import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Volume2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  History,
  TrendingUp,
  Info,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { WaveformVisualizer } from '../components/ui/WaveformVisualizer';
import { INITIAL_EXERCISES, speakPronunciation } from '../services/api';
import { PronunciationExercise, PronunciationAssessment } from '../types';
import { apiRequest } from '../services/http';
import { useAuthStore } from '../store/authStore';

const toPcmWav = async (input: Blob): Promise<Blob> => {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await input.arrayBuffer());
    const targetRate = 16000;
    const mono = new Float32Array(decoded.length);
    for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
      const samples = decoded.getChannelData(channel);
      for (let index = 0; index < decoded.length; index++) mono[index] += samples[index] / decoded.numberOfChannels;
    }
    const outputLength = Math.floor(decoded.length * targetRate / decoded.sampleRate);
    const buffer = new ArrayBuffer(44 + outputLength * 2);
    const view = new DataView(buffer);
    const writeText = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
    writeText(0, 'RIFF'); view.setUint32(4, 36 + outputLength * 2, true); writeText(8, 'WAVE'); writeText(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeText(36, 'data'); view.setUint32(40, outputLength * 2, true);
    for (let index = 0; index < outputLength; index++) {
      const sample = mono[Math.floor(index * decoded.sampleRate / targetRate)];
      view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * (sample < 0 ? 32768 : 32767), true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  } finally { await context.close(); }
};

export const PronunciationLab: React.FC = () => {
  const [exercises] = useState<PronunciationExercise[]>(INITIAL_EXERCISES);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [history, setHistory] = useState<PronunciationAssessment[]>([]);
  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [consent, setConsent] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');
  const [speechRate, setSpeechRate] = useState(0.82);
  const [accent, setAccent] = useState('en-GB');

  const timerRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedRef = useRef(0);
  const token = useAuthStore((state) => state.token);
  const currentExercise = exercises[activeExerciseIndex];

  // Speak the exercise target as a pronunciation reference.
  const handlePlayReference = () => {
    setIsPlayingRef(true);
    if (!speakPronunciation(currentExercise.target_text, () => setIsPlayingRef(false), { rate: speechRate, lang: accent })) setIsPlayingRef(false);
  };

  const handleStartRecording = async () => {
    try {
      setRecordingDuration(0); setAssessment(null); setAssessmentError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => { void assessRecordedAudio(); };
      recorder.start(); recordingStartedRef.current = Date.now(); setIsRecording(true);
      timerRef.current = window.setInterval(() => setRecordingDuration((previous) => {
        if (previous >= 29) { if (timerRef.current) clearInterval(timerRef.current); setIsRecording(false); recorderRef.current?.stop(); return 30; }
        return previous + 1;
      }), 1000);
    } catch (error) {
      setAssessmentError(error instanceof Error ? error.message : 'Microphone access is required. Check browser permissions.');
      setIsRecording(false);
    }
  };

  const assessRecordedAudio = async () => {
    setIsAssessing(true);
    try {
      const wav = await toPcmWav(new Blob(chunksRef.current));
      const form = new FormData();
      form.append('audio', wav, 'practice.wav');
      form.append('target_text', currentExercise.target_text);
      form.append('target_ipa', currentExercise.ipa_transcription);
      form.append('duration_ms', String(Math.max(300, Math.min(30000, Date.now() - recordingStartedRef.current))));
      form.append('consent', '1');
      const response = await apiRequest<{ assessment: PronunciationAssessment }>('/pronunciation/assess', { method: 'POST', body: form }, token);
      setAssessment(response.assessment);
      setHistory((previous) => [response.assessment, ...previous]);
    } catch (error) {
      setAssessmentError(error instanceof Error ? error.message : 'Assessment failed. Check Azure Speech configuration.');
    } finally {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null; setIsAssessing(false);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false); recorderRef.current?.stop();
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="primary" size="sm">Acoustic Speech Assessment</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Advanced AI Pronunciation Laboratory
          </h1>
          <p className="text-xs text-slate-500">
            Real pronunciation feedback on articulation, fluency, stress and rhythm
          </p>
        </div>

        <Badge variant="violet" size="sm">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Phoneme Granularity
        </Badge>
      </div>

      {/* Main Full-Width Practice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Practice Stage & Recording & Results */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 bg-white border border-slate-200 shadow-card">
            {/* Target Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Word</span>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {currentExercise.target_text}
                  </h2>
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-blue-600">
                    {currentExercise.ipa_transcription}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={handlePlayReference}
                isLoading={isPlayingRef}
                leftIcon={<Volume2 className="w-4 h-4 text-blue-600" />}
              >
                Reference Audio
              </Button>
            </div>

            {/* Guidance */}
            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Articulatory Guidance: </strong>
                {currentExercise.phonetic_explanation}
              </div>
            </div>

            {/* Waveform Visualizer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">
                  {isRecording
                    ? `Recording voice input (${recordingDuration}s)...`
                    : isAssessing
                    ? 'Processing speech acoustic features...'
                    : 'Acoustic waveform input ready'}
                </span>
                {isRecording && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
              </div>
              <WaveformVisualizer isRecording={isRecording} isPlaying={isPlayingRef} />
            </div>

            {/* Recording Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {!isRecording ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartRecording}
                  disabled={isAssessing || !consent}
                  leftIcon={<Mic className="w-5 h-5" />}
                  className="px-8 shadow-card"
                >
                  {assessment ? 'Record Another Attempt' : 'Record Your Voice'}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleStopRecording}
                  leftIcon={<Square className="w-5 h-5" />}
                  className="px-8 animate-pulse"
                >
                  Stop Recording ({recordingDuration}s)
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5" /><span>I consent to sending this recording to the configured speech assessment provider for feedback.</span></label>
              <div className="flex items-center gap-3"><label className="text-xs text-slate-600">Accent<select value={accent} onChange={(event) => setAccent(event.target.value)} className="ml-1 rounded border border-slate-300 bg-white px-2 py-1"><option value="en-GB">UK English</option><option value="en-US">US English</option></select></label><label className="text-xs text-slate-600">Playback speed<input aria-label="Playback speed" type="range" min="0.55" max="1" step="0.05" value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} className="ml-1 w-20 align-middle" /></label></div>
            </div>
            {isAssessing && <p role="status" className="text-center text-sm text-slate-500">Assessing your recording…</p>}
            {assessmentError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{assessmentError}</div>}

            {/* Assessment Result Panel */}
            {assessment && (
              <div className="pt-6 border-t border-slate-200 space-y-6">
                {/* Score Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
                    <span className={`text-2xl font-black ${assessment.overall_score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {assessment.overall_score}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Accuracy</span>
                    <span className="text-2xl font-black text-blue-600">{assessment.accuracy_score}%</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fluency</span>
                    <span className="text-2xl font-black text-purple-600">{assessment.fluency_score}%</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Prosody & Rhythm</span>
                    <span className="text-2xl font-black text-slate-800">
                      {assessment.prosody_score != null ? `${assessment.prosody_score}%` : 'Not provided'}
                    </span>
                  </div>
                </div>

                {/* Granular Phoneme Breakdown */}
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400">Assessment source: {assessment.provider}</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Phoneme-by-Phoneme Articulatory Breakdown
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">IPA Standard</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {assessment.phonemes.map((ph, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center space-y-1 ${
                          ph.status === 'correct'
                            ? 'bg-emerald-50 border-emerald-300'
                            : ph.status === 'acceptable'
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-amber-50 border-amber-300'
                        }`}
                      >
                        <span className="font-mono text-xl font-bold text-slate-900">
                          {ph.ipa_symbol}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            ph.status === 'correct'
                              ? 'text-emerald-700'
                              : ph.status === 'acceptable'
                              ? 'text-blue-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {ph.score}%
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          {ph.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Feedback */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Actionable Feedback</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {assessment.actionable_feedback}
                    </p>
                    {assessment.phonemes.some((p) => p.suggestion) && (
                      <div className="pt-2 text-amber-800 border-t border-slate-200 font-medium">
                        {assessment.phonemes.find((p) => p.suggestion)?.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Drill Selector & History */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Drills</CardTitle>
              <p className="text-xs text-slate-500">Curriculum pronunciation targets</p>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {exercises.map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveExerciseIndex(idx);
                    setAssessment(null);
                  }}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                    activeExerciseIndex === idx
                      ? 'border-blue-600 bg-blue-50/70 shadow-subtle'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ex.target_text}</h4>
                    <p className="font-mono text-xs text-blue-600">{ex.ipa_transcription}</p>
                  </div>
                  <Badge variant={ex.difficulty === 'beginner' ? 'success' : ex.difficulty === 'intermediate' ? 'primary' : 'violet'} size="sm">
                    {ex.difficulty}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Session Attempts</CardTitle>
              <History className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Your scored pronunciation attempts will appear here.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{h.target_text}</span>
                        <span className="text-[10px] text-slate-400 block">{h.created_at}</span>
                      </div>
                      <Badge variant={h.overall_score >= 80 ? 'success' : 'warning'} size="sm">
                        {h.overall_score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
