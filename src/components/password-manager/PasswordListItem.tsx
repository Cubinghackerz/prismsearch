
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink, Heart, Clock, AlertTriangle, Shield } from 'lucide-react';

interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_favorite?: boolean;
  breach_status?: 'safe' | 'breached' | 'checking';
  breach_count?: number;
}

interface PasswordListItemProps {
  password: StoredPassword;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onToggleFavorite: () => void;
  onCopy: (text: string, type: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PasswordListItem: React.FC<PasswordListItemProps> = ({
  password,
  isVisible,
  onToggleVisibility,
  onToggleFavorite,
  onCopy,
  onEdit,
  onDelete
}) => {
  const isExpired = password.expires_at && new Date(password.expires_at) < new Date();
  const isExpiringSoon = password.expires_at && !isExpired && 
    new Date(password.expires_at) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const getExpiryStatus = () => {
    if (isExpired) return { text: 'Expired', color: 'text-red-400', bg: 'bg-red-950/50' };
    if (isExpiringSoon) return { text: 'Expires Soon', color: 'text-amber-400', bg: 'bg-amber-950/50' };
    return null;
  };

  const getBreachStatus = () => {
    switch (password.breach_status) {
      case 'breached':
        return { text: `Breached (${password.breach_count?.toLocaleString()})`, color: 'text-red-400', bg: 'bg-red-950/50' };
      case 'checking':
        return { text: 'Checking...', color: 'text-blue-400', bg: 'bg-blue-950/50' };
      case 'safe':
        return { text: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-950/50' };
      default:
        return null;
    }
  };

  const expiryStatus = getExpiryStatus();
  const breachStatus = getBreachStatus();

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-200">{password.name}</h3>
            {password.is_favorite && (
              <Heart className="h-4 w-4 text-red-400 fill-red-400" />
            )}
          </div>
          {password.url && (
            <div className="flex items-center space-x-2">
              <a
                href={password.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>{password.url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          
          <div className="flex items-center space-x-2 flex-wrap">
            {expiryStatus && (
              <Badge variant="outline" className={`${expiryStatus.bg} ${expiryStatus.color} border-current text-xs`}>
                <Clock className="h-3 w-3 mr-1" />
                {expiryStatus.text}
              </Badge>
            )}
            
            {breachStatus && (
              <Badge variant="outline" className={`${breachStatus.bg} ${breachStatus.color} border-current text-xs`}>
                {password.breach_status === 'breached' ? (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                ) : password.breach_status === 'safe' ? (
                  <Shield className="h-3 w-3 mr-1" />
                ) : (
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {breachStatus.text}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFavorite}
            className={`border-slate-600 hover:bg-slate-700 ${
              password.is_favorite 
                ? 'hover:border-red-400 text-red-400' 
                : 'hover:border-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${password.is_favorite ? 'fill-red-400' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
            className="border-slate-600 hover:bg-slate-700 hover:border-cyan-500"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="border-slate-600 hover:bg-slate-700 hover:border-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex space-x-2">
          <Input
            type={isVisible ? "text" : "password"}
            value={password.password_encrypted}
            readOnly
            className="font-mono text-sm bg-slate-800/50 text-slate-200 border-slate-600"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleVisibility}
            className="border-slate-600 hover:bg-slate-700 hover:border-cyan-500"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onCopy(password.password_encrypted, 'Password')}
            className="border-slate-600 hover:bg-slate-700 hover:border-emerald-500"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Created: {new Date(password.created_at).toLocaleDateString()}
            {password.updated_at !== password.created_at && (
              <span> • Updated: {new Date(password.updated_at).toLocaleDateString()}</span>
            )}
            {password.expires_at && (
              <span> • Expires: {new Date(password.expires_at).toLocaleDateString()}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
