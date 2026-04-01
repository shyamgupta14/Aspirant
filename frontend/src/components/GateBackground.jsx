import { useEffect, useRef } from 'react';

const GATE_TOPICS = [
    'O(n log n)', 'P vs NP', 'DFS', 'BFS', 'LR Parser', 'LL(1)',
    'Context Switching', 'Paging', 'Deadlock', 'SQL', 'Normalization',
    '3NF', 'BCNF', 'B-Tree', 'TCP/IP', 'HTTP', 'DNS', 'DHCP',
    'Pipeline', 'Cache', 'Virtual Memory', 'Semaphore', 'Mutex',
    'Belady\'s Anomaly', 'Dining Philosophers', 'RAID', 'B+ Tree'
];

const MATH_SYMBOLS = ['∀x', '∃y', '¬p', 'p ∧ q', 'p ∨ q', '∑', '∫', '∝', '±', '∅', '∞', '≈'];
const LOGIC_GATES = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

export default function GateBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const items = [];
        const itemCount = 40;

        const createItem = () => {
            const types = [...GATE_TOPICS, ...MATH_SYMBOLS, ...LOGIC_GATES];
            return {
                text: types[Math.floor(Math.random() * types.length)],
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.4 + 0.1,
                fontSize: Math.random() * 14 + 10,
                pulse: Math.random() * 0.02
            };
        };

        for (let i = 0; i < itemCount; i++) {
            items.push(createItem());
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '700 12px "Fira Code", monospace';
            
            items.forEach(item => {
                ctx.fillStyle = `rgba(59, 130, 246, ${item.opacity})`;
                ctx.font = `${item.fontSize}px "Fira Code", monospace`;
                ctx.fillText(item.text, item.x, item.y);

                item.x += item.vx;
                item.y += item.vy;
                item.opacity += item.pulse;

                if (item.opacity > 0.5 || item.opacity < 0.05) item.pulse *= -1;

                if (item.x < -50) item.x = canvas.width + 50;
                if (item.x > canvas.width + 50) item.x = -50;
                if (item.y < -50) item.y = canvas.height + 50;
                if (item.y > canvas.height + 50) item.y = -50;
            });

            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none opacity-40"
            style={{ filter: 'blur(0.5px)' }}
        />
    );
}
