import React, { useState } from 'react';
import { Bookmark, Volume2, Plus, Sparkles, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { speakPronunciation } from '../services/api';

interface VocabItem {
  id: number;
  word: string;
  ipa: string;
  pos: string;
  definition: string;
  mastery: 'learning' | 'familiar' | 'mastered';
  notes: string;
}

export const VocabularyNotebook: React.FC = () => {
  const [items, setItems] = useState<VocabItem[]>([
    {
      id: 1,
      word: 'Articulation',
      ipa: '/ɑːˌtɪkjʊˈleɪʃən/',
      pos: 'noun',
      definition: 'The formation of clear and distinct sounds in speech.',
      mastery: 'mastered',
      notes: 'Remember the secondary stress on the first syllable and primary on -lay-.',
    },
    {
      id: 2,
      word: 'Diphthong',
      ipa: '/ˈdɪfθɒŋ/',
      pos: 'noun',
      definition: 'A sound formed by the combination of two vowels in a single syllable.',
      mastery: 'familiar',
      notes: 'Can be pronounced with either /f/ or /p/ initially.',
    },
    {
      id: 3,
      word: 'Schwa',
      ipa: '/ʃwɑː/',
      pos: 'noun',
      definition: 'The neutral mid-central unstressed vowel sound in English, represented as /ə/.',
      mastery: 'learning',
      notes: 'Most frequent sound in spoken English discourse.',
    },
    {
      id: 4,
      word: 'Fricative',
      ipa: '/ˈfrɪkətɪv/',
      pos: 'adjective / noun',
      definition: 'A consonant sound produced by forcing air through a narrow channel between articulators.',
      mastery: 'mastered',
      notes: 'Examples include /f/, /v/, /θ/, /ð/, /s/, /z/, /ʃ/, /ʒ/.',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newWord, setNewWord] = useState('');
  const [newIpa, setNewIpa] = useState('');
  const [newDef, setNewDef] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newIpa) return;

    const item: VocabItem = {
      id: Date.now(),
      word: newWord,
      ipa: newIpa.startsWith('/') ? newIpa : `/${newIpa}/`,
      pos: 'noun',
      definition: newDef || 'Institutional vocabulary entry.',
      mastery: 'learning',
      notes: 'Added from personal phonetics laboratory practice.',
    };

    setItems([item, ...items]);
    setNewWord('');
    setNewIpa('');
    setNewDef('');
  };

  const handleDeleteItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = items.filter(
    (i) =>
      i.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.ipa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="violet" size="sm">Personal Lexicon</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Student Vocabulary & Phonetics Notebook
          </h1>
          <p className="text-xs text-slate-500">
            Curate challenging English phonetic terms with verified IPA representations and audio playback
          </p>
        </div>

        <Badge variant="primary" size="md">
          {items.length} Entries Collected
        </Badge>
      </div>

      {/* Main Full-Width Grid: Add Form + Notebook Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: New Entry Form */}
        <div className="lg:col-span-4">
          <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Vocabulary Term
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <Input
                label="English Word"
                placeholder="e.g. Intonation"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                required
              />
              <Input
                label="IPA Transcription"
                placeholder="e.g. /ˌɪntəˈneɪʃən/"
                value={newIpa}
                onChange={(e) => setNewIpa(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Definition & Articulation Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Meaning and speech tips..."
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full">
                Save to Notebook
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Search & Notebook Term Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Filter by term or IPA symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <Card key={item.id} hoverEffect className="p-5 bg-white border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-slate-900">{item.word}</h4>
                    <span className="font-mono text-sm font-bold text-blue-600">{item.ipa}</span>
                    <Badge variant={item.mastery === 'mastered' ? 'success' : item.mastery === 'familiar' ? 'primary' : 'warning'} size="sm">
                      {item.mastery}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.definition}</p>
                  {item.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakPronunciation(item.word)}
                    leftIcon={<Volume2 className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Pronounce
                  </Button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
