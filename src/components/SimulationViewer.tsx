import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SimulationViewerProps {
  blueprint?: any;
  className?: string;
}

const SimulationViewer: React.FC<SimulationViewerProps> = ({ blueprint, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x0ea5e9, 2, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    // Neural Core
    const coreGroup = new THREE.Group();
    
    // Central sphere
    const coreGeom = new THREE.IcosahedronGeometry(1, 2);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x0ea5e9, 
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    coreGroup.add(core);

    // Data Rings
    const ringGeom = new THREE.TorusGeometry(2, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6, transparent: true, opacity: 0.4 });
    
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    ring1.rotation.x = Math.PI / 2;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.rotation.y = Math.PI / 2;
    coreGroup.add(ring2);

    const ring3 = new THREE.Mesh(ringGeom, ringMat);
    ring3.rotation.z = Math.PI / 4;
    coreGroup.add(ring3);

    // Floating particles
    const particlesGeom = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for(let i=0; i<particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    scene.add(coreGroup);

    camera.position.z = 6;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      coreGroup.rotation.y += 0.005;
      coreGroup.rotation.x += 0.002;
      
      ring1.rotation.z += 0.01;
      ring2.rotation.x += 0.01;
      ring3.rotation.y += 0.01;

      particles.rotation.y += 0.001;
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [blueprint]);

  return <div ref={containerRef} className={cn("w-full h-full min-h-[400px]", className)} />;
};

import { cn } from '../lib/utils';
export default SimulationViewer;
