import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Shield, TrendingUp, Clock, Eye, EyeOff, Lock, Key, CheckCircle, AlertTriangle, History, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import zxcvbn from 'zxcvbn';

interface PasswordAnalysis {
  password: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  entropy: number;
  crackTime: string;
  timestamp: string;
}

interface EncryptedNote {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  created_at: string;
}

interface SecurityScoreDashboardProps {
  passwords: Array<{
    id: string;
    name: string;
    password_encrypted: string;
    created_at: string;
    updated_at: string;
    is_favorite?: boolean;
    breach_status?: 'safe' | 'breached' | 'checking';
  }>;
  refreshKey?: number;
}

export const SecurityScoreDashboard: React.FC<SecurityScoreDashboardProps> = ({
  passwords,
  refreshKey = 0
}) => {
  const [overallScore, setOverallScore] = useState(0);
  const [passwordHistory, setPasswordHistory] = useState<PasswordAnalysis[]>([]);
  const [encryptedNotes, setEncryptedNotes] = useState<EncryptedNote[]>([]);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });
  const [showNoteContent, setShowNoteContent] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes'>('overview');
  const {
    toast
  } = useToast();

  useEffect(() => {
    calculateOverallScore();
    loadPasswordHistory();
    loadEncryptedNotes();
  }, [passwords, refreshKey]);

  const calculateOverallScore = () => {
    if (passwords.length === 0) {
      setOverallScore(0);
      return;
    }
    let totalScore = 0;
    let validPasswords = 0;
    passwords.forEach(password => {
      try {
        const analysis = zxcvbn(password.password_encrypted);
        const baseScore = analysis.score / 4 * 100;

        // Bonus points for good practices
        let bonusScore = 0;
        if (password.password_encrypted.length >= 16) bonusScore += 10;
        if (/[A-Z]/.test(password.password_encrypted)) bonusScore += 5;
        if (/[a-z]/.test(password.password_encrypted)) bonusScore += 5;
        if (/[0-9]/.test(password.password_encrypted)) bonusScore += 5;
        if (/[^a-zA-Z0-9]/.test(password.password_encrypted)) bonusScore += 5;
        if (password.breach_status === 'safe') bonusScore += 10;
        const finalScore = Math.min(100, baseScore + bonusScore);
        totalScore += finalScore;
        validPasswords++;
      } catch (error) {
        console.error('Error analyzing password:', error);
      }
    });
    const avgScore = validPasswords > 0 ? Math.round(totalScore / validPasswords) : 0;
    setOverallScore(avgScore);
  };

  const analyzePasswordStrengths = (password: string): string[] => {
    const strengths = [];
    if (password.length >= 16) strengths.push('Excellent length (16+ characters)');else if (password.length >= 12) strengths.push('Good length (12+ characters)');
    if (/[A-Z]/.test(password)) strengths.push('Contains uppercase letters');
    if (/[a-z]/.test(password)) strengths.push('Contains lowercase letters');
    if (/[0-9]/.test(password)) strengths.push('Contains numbers');
    if (/[^a-zA-Z0-9]/.test(password)) strengths.push('Contains special characters');
    const charTypes = [/[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
    if (charTypes >= 4) strengths.push('Uses all character types');
    return strengths;
  };

  const loadPasswordHistory = () => {
    try {
      const history = localStorage.getItem('password_history');
      if (history) {
        setPasswordHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading password history:', error);
    }
  };

  const loadEncryptedNotes = () => {
    try {
      const notes = localStorage.getItem('encrypted_notes');
      if (notes) {
        setEncryptedNotes(JSON.parse(notes));
      }
    } catch (error) {
      console.error('Error loading encrypted notes:', error);
    }
  };

  const addEncryptedNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Invalid note",
        description: "Please provide both title and content for the note.",
        variant: "destructive"
      });
      return;
    }
    const note: EncryptedNote = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      encrypted: true,
      created_at: new Date().toISOString()
    };
    const updatedNotes = [...encryptedNotes, note];
    setEncryptedNotes(updatedNotes);
    localStorage.setItem('encrypted_notes', JSON.stringify(updatedNotes));
    setNewNote({
      title: '',
      content: ''
    });
    toast({
      title: "Note added",
      description: "Your encrypted note has been saved securely."
    });
  };

  const deleteNote = (id: string) => {
    const updatedNotes = encryptedNotes.filter(note => note.id !== id);
    setEncryptedNotes(updatedNotes);
    localStorage.setItem('encrypted_notes', JSON.stringify(updatedNotes));
    toast({
      title: "Note deleted",
      description: "The encrypted note has been removed."
    });
  };

  const toggleNoteVisibility = (id: string) => {
    setShowNoteContent(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return {
      label: 'EXCELLENT',
      color: 'bg-emerald-600'
    };
    if (score >= 75) return {
      label: 'STRONG',
      color: 'bg-green-600'
    };
    if (score >= 60) return {
      label: 'GOOD',
      color: 'bg-cyan-600'
    };
    if (score >= 40) return {
      label: 'FAIR',
      color: 'bg-amber-600'
    };
    return {
      label: 'WEAK',
      color: 'bg-red-600'
    };
  };

  const scoreBadge = getScoreBadge(overallScore);
  const recentPasswords = passwords.slice(0, 5);

  return <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl py-0 my-[20px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-cyan-300">
            <Shield className="h-6 w-6" />
            <span>Security Score Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'outline'} size="sm" className={activeTab === 'overview' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button onClick={() => setActiveTab('history')} variant={activeTab === 'history' ? 'default' : 'outline'} size="sm" className={activeTab === 'history' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button onClick={() => setActiveTab('notes')} variant={activeTab === 'notes' ? 'default' : 'outline'} size="sm" className={activeTab === 'notes' ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-slate-600'}>
              <FileText className="h-4 w-4 mr-2" />
              Encrypted Notes
            </Button>
          </div>

          {activeTab === 'overview' && <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="text-6xl font-bold mb-2">
                    <span className={getScoreColor(overallScore)}>{overallScore}</span>
                    <span className="text-2xl text-slate-400">/100</span>
                  </div>
                  <Badge className={`${scoreBadge.color} text-white px-4 py-1`}>
                    {scoreBadge.label}
                  </Badge>
                </div>
                <Progress value={overallScore} className="w-full h-3" />
                <p className="text-slate-300">Overall Vault Health Score</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="h-5 w-5 text-cyan-400" />
                    <span className="font-medium text-slate-200">Total Passwords</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-300">{passwords.length}</p>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="font-medium text-slate-200">Safe Passwords</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-300">
                    {passwords.filter(p => p.breach_status === 'safe').length}
                  </p>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <span className="font-medium text-slate-200">Need Attention</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-300">
                    {passwords.filter(p => p.breach_status === 'breached').length}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                
                {recentPasswords.map((password, index) => {
              const strengths = analyzePasswordStrengths(password.password_encrypted);
              return <div key={password.id} className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{password.name}</span>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {strengths.map((strength, i) => <div key={i} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                            <span className="text-slate-300">{strength}</span>
                          </div>)}
                      </div>
                    </div>;
            })}
              </div>
            </div>}

          {activeTab === 'history' && <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Password History</span>
              </h3>
              
              {passwords.length === 0 ? <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No password history available</p>
                </div> : <div className="space-y-3">
                  {passwords.map((password, index) => <div key={password.id} className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{password.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {new Date(password.created_at).toLocaleDateString()}
                          </Badge>
                          {password.created_at !== password.updated_at && <Badge variant="outline" className="border-amber-600 text-amber-300">
                              Updated {new Date(password.updated_at).toLocaleDateString()}
                            </Badge>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Length: </span>
                          <span className="text-slate-200">{password.password_encrypted.length} characters</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Status: </span>
                          <Badge className={password.breach_status === 'safe' ? 'bg-emerald-600' : 'bg-red-600'}>
                            {password.breach_status === 'safe' ? 'Safe' : 'At Risk'}
                          </Badge>
                        </div>
                      </div>
                    </div>)}
                </div>}
            </div>}

          {activeTab === 'notes' && <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Add Encrypted Note</span>
                </h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Note title..." value={newNote.title} onChange={e => setNewNote(prev => ({
                ...prev,
                title: e.target.value
              }))} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:outline-none" />
                  <Textarea placeholder="Your private note content (encrypted)..." value={newNote.content} onChange={e => setNewNote(prev => ({
                ...prev,
                content: e.target.value
              }))} className="min-h-[100px] bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-cyan-500" />
                  <Button onClick={addEncryptedNote} className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700">
                    <Lock className="h-4 w-4 mr-2" />
                    Add Encrypted Note
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">Your Encrypted Notes</h3>
                {encryptedNotes.length === 0 ? <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No encrypted notes yet</p>
                  </div> : <div className="space-y-3">
                    {encryptedNotes.map(note => <div key={note.id} className="bg-slate-800/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-200">{note.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-emerald-600 text-white">
                              <Lock className="h-3 w-3 mr-1" />
                              Encrypted
                            </Badge>
                            <Button onClick={() => toggleNoteVisibility(note.id)} size="sm" variant="outline" className="border-slate-600 hover:bg-slate-700">
                              {showNoteContent[note.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button onClick={() => deleteNote(note.id)} size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-950/50">
                              Delete
                            </Button>
                          </div>
                        </div>
                        {showNoteContent[note.id] && <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-600">
                            <p className="text-slate-300 whitespace-pre-wrap">{note.content}</p>
                          </div>}
                        <p className="text-xs text-slate-400 mt-2">
                          Created: {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>)}
                  </div>}
              </div>
            </div>}
        </CardContent>
      </Card>
    </div>;
};
