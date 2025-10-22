import React, { useRef, useEffect } from 'react';

interface LitzAIVisualizerProps {
    analyserNode: AnalyserNode | null;
    isSessionActive: boolean;
}

const LitzAIVisualizer: React.FC<LitzAIVisualizerProps> = ({ analyserNode, isSessionActive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isSessionActive || !analyserNode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationFrameId: number;

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);
            analyserNode.getByteTimeDomainData(dataArray);

            // Use the CSS variable for the panel background for a seamless look
            const panelBg = getComputedStyle(canvas).getPropertyValue('--litz-ai-panel-bg').trim();
            canvasCtx.fillStyle = panelBg || 'rgba(13, 26, 46, 0.6)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const headerColor = getComputedStyle(canvas).getPropertyValue('--litz-ai-text-header').trim();
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = headerColor || 'rgb(251, 146, 60)';
            canvasCtx.shadowBlur = 5;
            canvasCtx.shadowColor = headerColor || 'rgb(251, 146, 60)';
            canvasCtx.lineCap = 'round';

            canvasCtx.beginPath();
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
             // Reset shadow for next draw call if needed elsewhere
            canvasCtx.shadowBlur = 0;
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (canvasCtx) {
                 const panelBg = getComputedStyle(canvas).getPropertyValue('--litz-ai-panel-bg').trim();
                 canvasCtx.fillStyle = panelBg || 'rgba(13, 26, 46, 0.6)';
                 canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };
    }, [isSessionActive, analyserNode]);

    return (
        <canvas ref={canvasRef} width="300" height="100" style={{ display: isSessionActive ? 'block' : 'none', transition: 'opacity 0.3s' }} />
    );
};

export default LitzAIVisualizer;