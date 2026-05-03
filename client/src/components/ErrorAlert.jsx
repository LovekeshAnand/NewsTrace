import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}