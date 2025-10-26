import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;
  
  return (
    <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-red-400">
      <AlertCircle size={20} />
      <span>{message}</span>
    </div>
  );
}