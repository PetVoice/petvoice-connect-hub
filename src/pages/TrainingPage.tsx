import React, { useState } from 'react';
import { TrainingProtocols } from '@/components/training/TrainingProtocols';
import { TrainingSessionComponent } from '@/components/training/TrainingSession';
import { TrainingProtocol, TrainingSession, VideoAnalysisResult } from '@/types/training';

export default function TrainingPage() {
  const [activeProtocol, setActiveProtocol] = useState<TrainingProtocol | null>(null);
  const [isInSession, setIsInSession] = useState(false);

  const handleProtocolCreate = (protocol: TrainingProtocol) => {
    console.log('New protocol created:', protocol);
  };

  const handleSessionStart = (protocol: TrainingProtocol) => {
    setActiveProtocol(protocol);
    setIsInSession(true);
  };

  const handleSessionComplete = (session: TrainingSession) => {
    console.log('Session completed:', session);
    setIsInSession(false);
  };

  const handleVideoAnalysis = (analysis: VideoAnalysisResult) => {
    console.log('Video analysis result:', analysis);
  };

  if (isInSession && activeProtocol) {
    return (
      <TrainingSessionComponent
        protocol={activeProtocol}
        onSessionComplete={handleSessionComplete}
        onVideoAnalysis={handleVideoAnalysis}
      />
    );
  }

  return (
    <TrainingProtocols
      onProtocolCreate={handleProtocolCreate}
      onSessionStart={handleSessionStart}
    />
  );
}