import React from 'react';
import { OmniparserView } from '../Omniparser/OmniparserView';
import { OperatorView } from '../Operator/OperatorView';
import { OllamaView } from '../Ollama/OllamaView';
import { DockView } from '../Dock/DockView';

import { Routes, Route, Navigate } from "react-router-dom";

export const OperationView: React.FC = () => {
  return (
    <div data-tauri-drag-region className="flex-1 w-full rounded-lg overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/dock" replace />} />
        <Route path="/dock" element={<DockView />} />
        <Route path="/omniparser" element={<OmniparserView />} />
        <Route path="/operator" element={<OperatorView />} />
        <Route path="/ollama" element={<OllamaView />} />
        <Route path="*" element={
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Page not found</p>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default OperationView;
