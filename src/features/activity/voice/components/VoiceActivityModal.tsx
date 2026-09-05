/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { ParsedVoiceActivity } from '../../../../lib/api';
import type { Project } from '../../../../entities';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useVoicePlayback } from '../hooks/useVoicePlayback';
import { useVoiceVisualizer } from '../hooks/useVoiceVisualizer';
import { voiceService } from '../services/voice.service';
import { VoiceModalHeader } from './VoiceModalHeader';
import { VoiceErrorBanner } from './VoiceErrorBanner';
import { VoiceIdleState } from './VoiceIdleState';
import { VoiceRecordingState } from './VoiceRecordingState';
import { VoiceRecordedState } from './VoiceRecordedState';
import { VoiceTipsPanel } from './VoiceTipsPanel';

interface VoiceActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityParsed: (activityData: ParsedVoiceActivity) => void;
  onFallbackToManual: () => void;
  projects: Project[];
}

export const VoiceActivityModal: React.FC<VoiceActivityModalProps> = ({
  isOpen,
  onClose,
  onActivityParsed,
  onFallbackToManual,
}) => {
  const {
    state: recordingState,
    audioBlob,
    audioUrl,
    duration,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const { audioRef, isPlaying, togglePlayback } = useVoicePlayback(audioUrl);
  const { canvasRef } = useVoiceVisualizer(recordingState);

  useEffect(() => {
    if (!isOpen) {
      resetRecording();
      setIsSending(false);
      setSendError(null);
    }
  }, [isOpen, resetRecording]);

  const openManualMode = () => {
    resetRecording();
    setSendError(null);
    onClose();
    onFallbackToManual();
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    setSendError(null);
    try {
      const parsedActivity:any = await voiceService.parseActivity(audioBlob);
      toast.success('Voice processed successfully!');
      console.log(parsedActivity);
      // onActivityParsed(parsedActivity);
      onClose();
    } catch (error: any) {
      console.error('Failed to send voice activity:', error);
      const message = error.message || 'Failed to process voice recording. You can continue manually.';
      setSendError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
          >
            <VoiceModalHeader isSending={isSending} onClose={onClose} />

            <div className="p-6 lg:p-8 flex flex-col items-center">
              <VoiceErrorBanner
                recordingError={recordingError}
                sendError={sendError}
                onFallbackToManual={openManualMode}
              />

              {recordingState === 'idle' && <VoiceIdleState onStart={startRecording} />}
              {recordingState === 'recording' && (
                <VoiceRecordingState duration={duration} canvasRef={canvasRef} onStop={stopRecording} />
              )}
              {recordingState === 'recorded' && (
                <VoiceRecordedState
                  audioBlob={audioBlob}
                  audioUrl={audioUrl}
                  duration={duration}
                  isPlaying={isPlaying}
                  isSending={isSending}
                  audioRef={audioRef}
                  onTogglePlayback={togglePlayback}
                  onReset={resetRecording}
                  onSend={handleSend}
                />
              )}
            </div>

            <VoiceTipsPanel isSending={isSending} onFallbackToManual={openManualMode} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
