import React, { useState } from 'react';
import { Volume2, Info, Keyboard, Sparkles, Check, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { IPA_SYMBOLS, speakPronunciation } from '../services/api';
import { IpaSymbol } from '../types';

export const IpaLab: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<IpaSymbol>(IPA_SYMBOLS[0]);
  const [typedTranscription, setTypedTranscription] = useState('');
  const [copied, setCopied] = useState(false);

  const monophthongs = IPA_SYMBOLS.filter((s) => s.category === 'monophthong');
  const diphthongs = IPA_SYMBOLS.filter((s) => s.category === 'diphthong');
  const consonants = IPA_SYMBOLS.filter((s) => s.category === 'consonant');

  const handleSelectSymbol = (sym: IpaSymbol) => {
    setSelectedSymbol(sym);
    speakPronunciation(sym.exampleWord);
  };

  const handleKeyClick = (char: string) => {
    setTypedTranscription((prev) => prev + char);
  };

  const handleCopyTranscription = () => {
    navigator.clipboard.writeText(`/${typedTranscription}/`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="violet" size="sm">Spoken Example Reference</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Interactive International Phonetic Alphabet (IPA)
          </h1>
          <p className="text-xs text-slate-500">
            Select a phoneme to hear its example word in your browser's English voice.
          </p>
        </div>

        <Badge variant="primary" size="sm">
          <Volume2 className="w-3.5 h-3.5 mr-1" />
          Spoken Examples Ready
        </Badge>
      </div>

      {/* Main Full-Width Grid: Chart & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Phoneme Grids */}
        <div className="lg:col-span-8 space-y-6">
          {/* Monophthongs */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>English Monophthongs (Pure Vowels)</CardTitle>
                <p className="text-xs text-slate-500">Organized across the English vowel space</p>
              </div>
              <Badge variant="primary" size="sm">12 Vowels</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {monophthongs.map((sym) => (
                  <button
                    key={sym.symbol}
                    onClick={() => handleSelectSymbol(sym)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      selectedSymbol.symbol === sym.symbol
                        ? 'border-blue-600 bg-blue-600 text-white shadow-card scale-105'
                        : 'border-slate-200 bg-white hover:border-blue-400 text-slate-800'
                    }`}
                  >
                    <span className="font-mono text-xl font-bold">/{sym.symbol}/</span>
                    <span className="text-[10px] opacity-75 mt-0.5">{sym.exampleWord}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Diphthongs */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>English Diphthongs (Gliding Vowels)</CardTitle>
                <p className="text-xs text-slate-500">Articulatory glides between two vowel targets</p>
              </div>
              <Badge variant="violet" size="sm">7 Diphthongs</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {diphthongs.map((sym) => (
                  <button
                    key={sym.symbol}
                    onClick={() => handleSelectSymbol(sym)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      selectedSymbol.symbol === sym.symbol
                        ? 'border-purple-600 bg-purple-600 text-white shadow-card scale-105'
                        : 'border-slate-200 bg-white hover:border-purple-400 text-slate-800'
                    }`}
                  >
                    <span className="font-mono text-xl font-bold">/{sym.symbol}/</span>
                    <span className="text-[10px] opacity-75 mt-0.5">{sym.exampleWord}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consonants */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>English Consonant Inventory</CardTitle>
                <p className="text-xs text-slate-500">Voiced and voiceless articulatory pairs</p>
              </div>
              <Badge variant="success" size="sm">Consonant Matrix</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-2.5">
                {consonants.map((sym) => (
                  <button
                    key={sym.symbol}
                    onClick={() => handleSelectSymbol(sym)}
                    className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      selectedSymbol.symbol === sym.symbol
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-card scale-105'
                        : 'border-slate-200 bg-white hover:border-emerald-400 text-slate-800'
                    }`}
                  >
                    <span className="font-mono text-xl font-bold">/{sym.symbol}/</span>
                    <span className="text-[10px] opacity-75 mt-0.5">{sym.exampleWord}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Virtual Phonetic Keyboard */}
          <Card className="p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Phonetic Transcription Keyboard
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Click symbols to compose IPA transcription</span>
            </div>

            {/* Display Bar */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="font-mono text-xl font-bold text-blue-600 tracking-wider">
                /{typedTranscription || 'transcription_preview'}/
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTypedTranscription('')}
                  disabled={!typedTranscription}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyTranscription}
                  disabled={!typedTranscription}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copied' : 'Copy IPA'}
                </Button>
              </div>
            </div>

            {/* Keyboard Keys */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {IPA_SYMBOLS.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => handleKeyClick(s.symbol)}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-mono text-sm font-bold text-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-subtle"
                >
                  {s.symbol}
                </button>
              ))}
              <button
                onClick={() => handleKeyClick('ˈ')}
                className="px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold"
                title="Primary Stress Mark"
              >
                ˈ
              </button>
              <button
                onClick={() => handleKeyClick('ˌ')}
                className="px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold"
                title="Secondary Stress Mark"
              >
                ˌ
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Phoneme Inspector */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-6 bg-white border border-slate-200 sticky top-20 shadow-card">
            <div className="text-center space-y-3 pb-6 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Phoneme</span>
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center font-mono text-4xl font-black shadow-card">
                /{selectedSymbol.symbol}/
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedSymbol.name}
              </h3>
              <Badge variant="violet" size="sm">{selectedSymbol.subCategory || selectedSymbol.category}</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Articulatory Description:</span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedSymbol.articulationTip}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Lexical Target Example:</span>
                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 capitalize">{selectedSymbol.exampleWord}</span>
                    <span className="font-mono text-blue-600 ml-2">{selectedSymbol.exampleIpa}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakPronunciation(selectedSymbol.exampleWord)}
                    leftIcon={<Volume2 className="w-3.5 h-3.5" />}
                  >
                    Hear Example
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
