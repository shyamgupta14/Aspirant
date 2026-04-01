import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function ThreeBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); 

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000 * 3; i++) positions[i] = (Math.random() - 0.5) * 50;
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.1, color: 0x2563eb, transparent: true, opacity: 0.3 }));
        scene.add(points);
        camera.position.z = 25;

        let reqId;
        const anim = () => {
            reqId = requestAnimationFrame(anim);
            points.rotation.y += 0.0003;
            points.rotation.x += 0.0001;
            renderer.render(scene, camera);
        };
        anim();

        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 4;
            const y = (e.clientY / window.innerHeight - 0.5) * 4;
            gsap.to(points.rotation, { x: y * 0.1, y: x * 0.1, duration: 1.5 });
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            geometry.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} id="bg-canvas" className="fixed top-0 left-0 w-full h-full -z-10 opacity-70 pointer-events-none" />;
}
