
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';

interface StoredPassword {
  id: string;
  name: string;
  url?: string;
  password_encrypted: string;
  created_at: string;
  updated_at: string;
}

interface PasswordListItemProps {
  password: StoredPassword;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onCopy: (text: string, type: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PasswordListItem: React.FC<PasswordListItemProps> = ({
  password,
  isVisible,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete
}) => {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-200">{password.name}</h3>
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
        </div>
        <div className="flex items-center space-x-2">
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
        <p className="text-xs text-slate-500">
          Created: {new Date(password.created_at).toLocaleDateString()}
          {password.updated_at !== password.created_at && (
            <span> • Updated: {new Date(password.updated_at).toLocaleDateString()}</span>
          )}
        </p>
      </div>
    </div>
  );
};
