import React, { useEffect, useMemo, useState } from 'react';
import { Gamepad2, Trophy, Timer, CheckCircle2, XCircle, Volume2, ArrowRight, RotateCcw, VolumeX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { INITIAL_GAMES, speakPronunciation } from '../services/api';
import { GameItem } from '../types';
import { LiveQuiz } from '../components/games/LiveQuiz';

type Option = { label: string; ipa: string; isCorrect: boolean };
type Question = { prompt: string; audioText: string; options: Option[]; explanation: string };
const option = (label: string, ipa = '', isCorrect = false): Option => ({ label, ipa, isCorrect });
const questionSets: Record<string, Question[]> = {
  minimal_pairs: [
    { prompt: 'Listen. Which word has the long vowel /iː/?', audioText: 'ship. Sheep.', options: [option('Ship', '/ʃɪp/'), option('Sheep', '/ʃiːp/', true), option('Chip', '/tʃɪp/'), option('Dip', '/dɪp/')], explanation: 'Sheep has the long vowel /iː/. Ship has the shorter vowel /ɪ/.' },
    { prompt: 'Which word begins with the dental sound /θ/?', audioText: 'sink. Think. Zinc. Fink.', options: [option('Sink', '/sɪŋk/'), option('Think', '/θɪŋk/', true), option('Zinc', '/zɪŋk/'), option('Fink', '/fɪŋk/')], explanation: 'Think begins with /θ/, made with the tongue close to or between the teeth.' },
    { prompt: 'Which word has the vowel /æ/ as in “cat”?', audioText: 'cut. Cat. Cot. Kit.', options: [option('Cut', '/kʌt/'), option('Cat', '/kæt/', true), option('Cot', '/kɒt/'), option('Kit', '/kɪt/')], explanation: 'Cat contains the near-open front vowel /æ/.' },
  ],
  sound_recognition: [
    { prompt: 'Which IPA symbol matches the first sound in “measure”?', audioText: 'measure', options: [option('/ʒ/', 'voiced postalveolar fricative', true), option('/ʃ/', 'voiceless postalveolar fricative'), option('/dʒ/', 'voiced affricate'), option('/z/', 'voiced alveolar fricative')], explanation: 'The middle sound in measure is /ʒ/, also heard at the end of “beige”.' },
    { prompt: 'Which symbol represents the first sound in “sing”?', audioText: 'sing', options: [option('/n/', 'alveolar nasal'), option('/ŋ/', 'velar nasal', true), option('/g/', 'velar stop'), option('/m/', 'bilabial nasal')], explanation: 'The final sound in sing is /ŋ/, produced at the back of the mouth.' },
    { prompt: 'Which IPA symbol is the “th” sound in “this”?', audioText: 'this', options: [option('/θ/', 'voiceless dental fricative'), option('/ð/', 'voiced dental fricative', true), option('/d/', 'voiced alveolar stop'), option('/z/', 'voiced alveolar fricative')], explanation: 'This begins with voiced /ð/. Feel the vibration in your throat.' },
  ],
  word_stress: [
    { prompt: 'Where is the main stress in “phonetics”?', audioText: 'phonetics', options: [option('First syllable: PHO-net-ics'), option('', '', true), option('Third syllable: pho-net-ICS')], explanation: 'Phonetics is stressed on its second syllable: /fəˈnetɪks/.' },
    { prompt: 'Where is the main stress in “photograph”?', audioText: 'photograph', options: [option('', '', true), option('Second syllable: pho-TO-graph'), option('Third syllable: pho-to-GRAPH')], explanation: 'Photograph carries primary stress on the first syllable: /ˈfəʊtəɡrɑːf/.' },
    { prompt: 'Where is the main stress in “banana”?', audioText: 'banana', options: [option('First syllable: BA-na-na'), option('', '', true), option('Third syllable: ba-na-NA')], explanation: 'Banana is stressed on the middle syllable: /bəˈnɑːnə/.' },
  ],
  phonetic_transcription: [
    { prompt: 'Choose the IPA transcription of “ship”.', audioText: 'ship', options: [option('/ʃiːp/', 'long vowel'), option('/ʃɪp/', 'short vowel', true), option('/sɪp/', 'different first sound')], explanation: 'Ship is /ʃɪp/: the first sound is /ʃ/ and the vowel is /ɪ/.' },
    { prompt: 'Choose the IPA transcription of “thin”.', audioText: 'thin', options: [option('/θɪn/', 'voiceless th', true), option('/ðɪn/', 'voiced th'), option('/tɪn/', 'alveolar stop')], explanation: 'Thin begins with voiceless /θ/.' },
    { prompt: 'Choose the IPA transcription of “sheep”.', audioText: 'sheep', options: [option('/ʃɪp/', 'short vowel'), option('/ʃiːp/', 'long vowel', true), option('/tʃiːp/', 'affricate')], explanation: 'Sheep is /ʃiːp/, with the long vowel /iː/.' },
  ],
  syllable_count: [
    { prompt: 'How many syllables do you hear in “teacher”?', audioText: 'teacher', options: [option('1 syllable'), option('', '', true), option('3 syllables')], explanation: 'Teacher has two syllables: teach-er.' },
    { prompt: 'How many syllables do you hear in “university”?', audioText: 'university', options: [option('3 syllables'), option('4 syllables'), option('', '', true)], explanation: 'University is commonly pronounced with five syllables: u-ni-ver-si-ty.' },
    { prompt: 'How many syllables do you hear in “strengths”?', audioText: 'strengths', options: [option('', '', true), option('2 syllables'), option('3 syllables')], explanation: 'Strengths has one syllable, even though it contains a complex consonant cluster.' },
  ],
  voicing_detective: [
    { prompt: 'Which word starts with a voiced consonant?', audioText: 'fan. van. fan. van.', options: [option('Fan', '/f/',), option('Van', '/v/', true)], explanation: '/v/ is voiced: your vocal folds vibrate. /f/ is its voiceless partner.' },
    { prompt: 'Which first sound is voiceless?', audioText: 'zip. sip.', options: [option('/z/ in zip'), option('/s/ in sip', '/s/', true)], explanation: '/s/ is voiceless; /z/ is voiced.' },
    { prompt: 'Which word ends with a voiced consonant?', audioText: 'back. bag.', options: [option('Back', '/k/'), option('Bag', '/g/', true)], explanation: '/g/ is voiced, while /k/ is voiceless.' },
  ],
  rhyme_time: [
    { prompt: 'Which word rhymes with “light”?', audioText: 'light', options: [option('Late', '/leɪt/'), option('Night', '/naɪt/', true), option('Lit', '/lɪt/'), option('Lot', '/lɒt/')], explanation: 'Light and night share the same final vowel and consonant sounds: /aɪt/.' },
    { prompt: 'Which word rhymes with “train”?', audioText: 'train', options: [option('Tree', '/triː/'), option('Brain', '/breɪn/', true), option('Turn', '/tɜːn/'), option('Try', '/traɪ/')], explanation: 'Train and brain share the ending /eɪn/.' },
    { prompt: 'Which word rhymes with “book”?', audioText: 'book', options: [option('Look', '/lʊk/', true), option('Luke', '/luːk/'), option('Back', '/bæk/'), option('Bake', '/beɪk/')], explanation: 'Book and look share the vowel /ʊ/ and final /k/.' },
  ],
  sound_position: [
    { prompt: 'Which word begins with /tʃ/ as in “chair”?', audioText: 'chair', options: [option('Share', '/ʃeə/'), option('Chair', '/tʃeə/', true), option('There', '/ðeə/'), option('Care', '/keə/')], explanation: 'Chair begins with the affricate /tʃ/.' },
    { prompt: 'Which word ends with /ŋ/?', audioText: 'sing', options: [option('Sin', '/sɪn/'), option('Sing', '/sɪŋ/', true), option('Sit', '/sɪt/'), option('Sip', '/sɪp/')], explanation: 'Sing ends in the velar nasal /ŋ/.' },
    { prompt: 'Which word begins with /w/?', audioText: 'west', options: [option('Vest', '/vest/'), option('West', '/west/', true), option('Rest', '/rest/'), option('Best', '/best/')], explanation: 'West starts with the approximant /w/; vest starts with /v/.' },
  ],
};

export const GamesEngine: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const questions = useMemo(() => activeGame ? questionSets[activeGame.type] || [] : [], [activeGame]);
  const currentQ = questions[currentQuestionIndex];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!activeGame || isGameOver || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (!isAnswerChecked && /^[1-4]$/.test(event.key) && Number(event.key) <= (currentQ?.options.length ?? 0)) setSelectedOption(Number(event.key) - 1);
      if (event.key === 'Enter' && !isAnswerChecked && selectedOption !== null) handleCheckAnswer();
      else if (event.key === 'Enter' && isAnswerChecked) handleNextQuestion();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGame, currentQ, isAnswerChecked, isGameOver, selectedOption]);

  useEffect(() => {
    if (!activeGame || isGameOver) return;
    const interval = window.setInterval(() => setTimeLeft((previous) => {
      if (previous <= 1) { setIsGameOver(true); return 0; }
      return previous - 1;
    }), 1000);
    return () => window.clearInterval(interval);
  }, [activeGame, isGameOver]);

  const handleStartGame = (game: GameItem) => {
    setActiveGame(game); setCurrentQuestionIndex(0); setScore(0); setCorrectAnswers(0);
    setTimeLeft(game.timeLimit); setIsGameOver(false); setSelectedOption(null); setIsAnswerChecked(false);
  };
  const handleCheckAnswer = () => {
    if (selectedOption === null || !currentQ) return;
    setIsAnswerChecked(true);
    if (currentQ.options[selectedOption].isCorrect) { setScore((previous) => previous + 10); setCorrectAnswers((previous) => previous + 1); speakPronunciation('Correct!'); }
    else speakPronunciation('Try again.');
  };
  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) { setCurrentQuestionIndex((previous) => previous + 1); setSelectedOption(null); setIsAnswerChecked(false); }
    else setIsGameOver(true);
  };
  const passed = Boolean(activeGame && questions.length && correctAnswers / questions.length * 100 >= activeGame.passingScore);

  return <div className="w-full space-y-8">
    <LiveQuiz />
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center"><div><Badge variant="warning" size="sm">Pronunciation Practice</Badge><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Educational Games</h1><p className="text-xs text-slate-500">Play eight different games for listening, IPA, stress, syllables and speech sounds.</p></div><Badge variant="primary" size="sm"><Trophy className="mr-1 h-3.5 w-3.5" />8 game types</Badge></div>
    {!activeGame ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{INITIAL_GAMES.map((game) => <Card key={game.id} hoverEffect className="flex flex-col justify-between space-y-4 border border-slate-200 bg-white p-6"><div className="space-y-3"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Gamepad2 className="h-5 w-5" /></div><Badge variant={game.difficulty === 'easy' ? 'success' : game.difficulty === 'medium' ? 'primary' : 'warning'} size="sm">{game.difficulty}</Badge></div><h3 className="text-base font-bold text-slate-900">{game.title}</h3><p className="text-xs leading-relaxed text-slate-600">{game.description}</p><div className="flex justify-between pt-2 text-[11px] text-slate-400"><span>{game.questionsCount} rounds</span><span>{game.timeLimit}s</span><span>Pass {game.passingScore}%</span></div></div><Button onClick={() => handleStartGame(game)} size="sm" rightIcon={<ArrowRight className="h-4 w-4" />} className="w-full">Play game</Button></Card>)}</div>
      : isGameOver ? <Card className="mx-auto max-w-xl space-y-6 border border-slate-200 bg-white p-8 text-center shadow-card"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${passed ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-amber-200 bg-amber-50 text-amber-600'}`}><Trophy className="h-8 w-8" /></div><div><h2 className="text-2xl font-bold text-slate-900">{timeLeft === 0 ? 'Time is up!' : 'Game completed!'}</h2><p className="text-sm text-slate-500">{activeGame.title}</p></div><div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"><div><span className="text-xs font-bold uppercase text-slate-400">Score</span><span className="block text-3xl font-black text-blue-600">{score} pts</span></div><div><span className="text-xs font-bold uppercase text-slate-400">Result</span><span className={`block text-xl font-black ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>{passed ? 'PASSED' : 'KEEP PRACTICING'}</span></div></div><p className="text-sm text-slate-600">Correct answers: {correctAnswers} / {questions.length}</p><div className="flex justify-center gap-3"><Button variant="outline" onClick={() => handleStartGame(activeGame)} leftIcon={<RotateCcw className="h-4 w-4" />}>Play again</Button><Button onClick={() => setActiveGame(null)}>Game catalog</Button></div></Card>
      : currentQ && <Card className="mx-auto max-w-3xl space-y-6 border border-slate-200 bg-white p-6 shadow-card sm:p-8"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><span className="text-xs font-bold uppercase text-blue-600">{activeGame.title}</span><p className="text-xs text-slate-500">Round {currentQuestionIndex + 1} of {questions.length}</p></div><div className="flex items-center gap-4"><span className="flex items-center gap-1.5 text-xs font-bold text-amber-600"><Timer className="h-4 w-4" />{timeLeft}s</span><Badge variant="primary" size="sm">{score} pts</Badge></div></div><div className="space-y-4 text-center"><h3 className="mx-auto max-w-lg text-base font-bold text-slate-900">{currentQ.prompt}</h3><Button variant="outline" size="sm" onClick={() => speakPronunciation(currentQ.audioText)} leftIcon={<Volume2 className="h-4 w-4 text-blue-600" />}>Listen to audio</Button><p className="text-xs text-slate-400"><VolumeX className="mr-1 inline h-3.5 w-3.5" />Uses your browser’s English speech voice</p></div><div role="group" aria-label="Answer choices" className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">{currentQ.options.map((answer, index) => { const selected = selectedOption === index; let style = 'border-slate-200 bg-white hover:border-blue-400'; if (isAnswerChecked && answer.isCorrect) style = 'border-emerald-500 bg-emerald-50 font-bold text-emerald-800'; else if (isAnswerChecked && selected) style = 'border-rose-500 bg-rose-50 text-rose-800'; else if (selected) style = 'border-blue-600 bg-blue-50 font-bold text-blue-700'; return <button key={`${answer.label}-${index}`} aria-pressed={selected} disabled={isAnswerChecked} onClick={() => setSelectedOption(index)} className={`flex items-center justify-between rounded-lg border p-4 text-left transition-all ${style}`}><span><span className="block text-sm font-bold">{index + 1}. {answer.label}</span><span className="font-mono text-xs opacity-75">{answer.ipa}</span></span>{isAnswerChecked && answer.isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}{isAnswerChecked && selected && !answer.isCorrect && <XCircle className="h-5 w-5 text-rose-600" />}</button>; })}</div><p className="text-center text-[11px] text-slate-400">Keyboard: press 1–4 to select, Enter to submit or continue.</p>{isAnswerChecked && <div aria-live="polite" className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs leading-relaxed text-slate-700"><strong>Why: </strong>{currentQ.explanation}</div>}<div className="flex items-center justify-between border-t border-slate-100 pt-4"><Button variant="ghost" size="sm" onClick={() => { setActiveGame(null); setIsGameOver(false); }}>Exit game</Button>{!isAnswerChecked ? <Button onClick={handleCheckAnswer} disabled={selectedOption === null}>Check answer</Button> : <Button onClick={handleNextQuestion} rightIcon={<ArrowRight className="h-4 w-4" />}>{currentQuestionIndex + 1 < questions.length ? 'Next round' : 'See results'}</Button>}</div></Card>}
  </div>;
};
