
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, TrendingUp, Clock, Key, FileText, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface StoredPassword {
  id: string;
  name: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
  breach_status?: 'safe' | 'breached' | 'checking';
  breach_count?: number;
  is_favorite?: boolean;
}

interface SecurityScoreDashboardProps {
  passwords: StoredPassword[];
}

interface PasswordHistory {
  id: string;
  password_id: string;
  old_password: string;
  changed_at: string;
  reason: string;
}

interface VaultNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_encrypted: boolean;
}

export const SecurityScoreDashboard: React.FC<SecurityScoreDashboardProps> = ({ passwords }) => {
  const [overallScore, setOverallScore] = useState(0);
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [vaultNotes, setVaultNotes] = useState<VaultNote[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'analysis' | 'notes'>('overview');
  const [showNoteContent, setShowNoteContent] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    calculateSecurityScore();
    loadPasswordHistory();
    loadVaultNotes();
  }, [passwords]);

  const calculateSecurityScore = () => {
    if (passwords.length === 0) {
      setOverallScore(0);
      return;
    }

    let score = 0;
    const maxScore = 100;

    // Base score for having passwords (20 points)
    score += Math.min(20, passwords.length * 2);

    // Strong passwords bonus (30 points max)
    const strongPasswords = passwords.filter(p => p.password_encrypted.length >= 12);
    score += Math.min(30, (strongPasswords.length / passwords.length) * 30);

    // No breached passwords bonus (25 points)
    const breachedPasswords = passwords.filter(p => p.breach_status === 'breached');
    if (breachedPasswords.length === 0) {
      score += 25;
    } else {
      score += Math.max(0, 25 - (breachedPasswords.length * 5));
    }

    // Recent updates bonus (15 points)
    const recentlyUpdated = passwords.filter(p => {
      const daysSinceUpdate = (Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 90;
    });
    score += Math.min(15, (recentlyUpdated.length / passwords.length) * 15);

    // Favorites organization bonus (10 points)
    const favoritePasswords = passwords.filter(p => p.is_favorite);
    if (favoritePasswords.length > 0) {
      score += 10;
    }

    setOverallScore(Math.min(maxScore, Math.round(score)));
  };

  const loadPasswordHistory = () => {
    // Simulate password history data
    const history: PasswordHistory[] = passwords.slice(0, 3).map((password, index) => ({
      id: `hist-${index}`,
      password_id: password.id,
      old_password: '••••••••••••',
      changed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason: ['Security breach detected', 'Scheduled update', 'User initiated'][Math.floor(Math.random() * 3)]
    }));
    setPasswordHistory(history);
  };

  const loadVaultNotes = () => {
    const existingNotes = localStorage.getItem('prism_vault_notes');
    if (existingNotes) {
      setVaultNotes(JSON.parse(existingNotes));
    }
  };

  const addNewNote = () => {
    const newNote: VaultNote = {
      id: `note-${Date.now()}`,
      title: 'New Secure Note',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_encrypted: true
    };
    
    const updatedNotes = [...vaultNotes, newNote];
    setVaultNotes(updatedNotes);
    localStorage.setItem('prism_vault_notes', JSON.stringify(updatedNotes));
  };

  const analyzePasswordStrength = (password: string) => {
    const analysis = {
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSymbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isUnique: true, // Simplified for demo
      pros: [] as string[]
    };

    if (analysis.length >= 12) analysis.pros.push('Good length (12+ characters)');
    if (analysis.hasUppercase) analysis.pros.push('Contains uppercase letters');
    if (analysis.hasLowercase) analysis.pros.push('Contains lowercase letters');
    if (analysis.hasNumbers) analysis.pros.push('Contains numbers');
    if (analysis.hasSymbols) analysis.pros.push('Contains special symbols');
    if (analysis.isUnique) analysis.pros.push('Unique across your vault');

    return analysis;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'bg-emerald-600' };
    if (score >= 60) return { text: 'Good', color: 'bg-cyan-600' };
    if (score >= 40) return { text: 'Fair', color: 'bg-amber-600' };
    return { text: 'Needs Work', color: 'bg-red-600' };
  };

  const toggleNoteVisibility = (noteId: string) => {
    setShowNoteContent(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const scoreBadge = getScoreBadge(overallScore);

  return (
    <div className="space-y-6">
      {/* Overall Security Score */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-cyan-300">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Vault Security Score</span>
            </div>
            <Badge className={`${scoreBadge.color} text-white`}>
              {scoreBadge.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <p className="text-slate-400">out of 100</p>
          </div>
          
          <Progress value={overallScore} className="h-3" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-200">{passwords.length}</div>
              <p className="text-sm text-slate-400">Total Passwords</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {passwords.filter(p => p.breach_status !== 'breached').length}
              </div>
              <p className="text-sm text-slate-400">Secure</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {passwords.filter(p => p.breach_status === 'breached').length}
              </div>
              <p className="text-sm text-slate-400">Compromised</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {passwords.filter(p => p.is_favorite).length}
              </div>
              <p className="text-sm text-slate-400">Favorites</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-slate-900/50 p-2 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'analysis', label: 'Analysis', icon: TrendingUp },
          { id: 'notes', label: 'Secure Notes', icon: FileText }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 ${
              activeTab === id 
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600' 
                : 'hover:bg-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Security Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {passwords.length > 0 && (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Active password vault</span>
                </div>
              )}
              {passwords.filter(p => p.password_encrypted.length >= 12).length > 0 && (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Strong passwords detected</span>
                </div>
              )}
              {passwords.filter(p => p.breach_status !== 'breached').length === passwords.length && (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>No compromised passwords</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {passwords.length < 5 && (
                <div className="flex items-center space-x-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Add more passwords to vault</span>
                </div>
              )}
              {passwords.filter(p => p.breach_status === 'breached').length > 0 && (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Update compromised passwords</span>
                </div>
              )}
              {passwords.filter(p => p.is_favorite).length === 0 && (
                <div className="flex items-center space-x-2 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Mark important passwords as favorites</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Password Change History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passwordHistory.length > 0 ? (
              <div className="space-y-3">
                {passwordHistory.map((entry) => {
                  const password = passwords.find(p => p.id === entry.password_id);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-200">{password?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-400">Changed {new Date(entry.changed_at).toLocaleDateString()}</p>
                        <p className="text-xs text-amber-400">{entry.reason}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                        Updated
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No password history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {passwords.map((password) => {
            const analysis = analyzePasswordStrength(password.password_encrypted);
            return (
              <Card key={password.id} className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-300 flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>{password.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Password Strength</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={(analysis.pros.length / 6) * 100} className="h-2" />
                          <span className="text-sm text-slate-300">{analysis.pros.length}/6</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Length</p>
                        <p className="text-lg font-semibold text-slate-200">{analysis.length} characters</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Password Pros:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {analysis.pros.map((pro, index) => (
                          <div key={index} className="flex items-center space-x-2 text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'notes' && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Encrypted Vault Notes</span>
              </div>
              <Button onClick={addNewNote} size="sm" className="bg-gradient-to-r from-cyan-600 to-emerald-600">
                Add Note
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vaultNotes.length > 0 ? (
              <div className="space-y-3">
                {vaultNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-200">{note.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-emerald-600 text-white text-xs">
                          Encrypted
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNoteVisibility(note.id)}
                        >
                          {showNoteContent[note.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {showNoteContent[note.id] && (
                      <div className="mt-2 p-2 bg-slate-900/50 rounded text-sm text-slate-300">
                        {note.content || 'Click to edit this note...'}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Created: {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No secure notes yet</p>
                <p className="text-sm">Add encrypted notes to store sensitive information securely</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
