"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

export function PhotoCropModal({ src, onConfirm, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const lastMouse = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  // Keep live refs for pan/scale so event handlers always have current values
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const minScaleRef = useRef(0.1);

  function initScale() {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const min = Math.max(
      container.clientWidth / img.naturalWidth,
      container.clientHeight / img.naturalHeight,
    );
    minScaleRef.current = min;
    scaleRef.current = min;
    setScale(min);
    setImgLoaded(true);
  }

  function clampedScale(next: number) {
    return Math.max(minScaleRef.current, Math.min(8, next));
  }

  // Non-passive wheel listener so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.93;
      const next = clampedScale(scaleRef.current * factor);
      scaleRef.current = next;
      setScale(next);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Non-passive touch listener so we can preventDefault scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouse.current.x;
        const dy = e.touches[0].clientY - lastMouse.current.y;
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        panRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
        setPanX(panRef.current.x);
        setPanY(panRef.current.y);
      } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / lastPinchDist.current;
        lastPinchDist.current = dist;
        const next = clampedScale(scaleRef.current * ratio);
        scaleRef.current = next;
        setScale(next);
      }
    }
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    panRef.current = { x: panRef.current.x + dx, y: panRef.current.y + dy };
    setPanX(panRef.current.x);
    setPanY(panRef.current.y);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }

  function handleTouchEnd() {
    setIsDragging(false);
    lastPinchDist.current = null;
  }

  function handleRotate() {
    setRotation((r) => (r + 90) % 360);
    // Swap pan axes to keep the visual position intuitive after rotate
    const prev = panRef.current;
    panRef.current = { x: -prev.y, y: prev.x };
    setPanX(panRef.current.x);
    setPanY(panRef.current.y);
    // Recalculate min scale for new orientation
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const isLandscape = (rotation + 90) % 180 === 0;
    const w = isLandscape ? img.naturalHeight : img.naturalWidth;
    const h = isLandscape ? img.naturalWidth : img.naturalHeight;
    const min = Math.max(container.clientWidth / w, container.clientHeight / h);
    minScaleRef.current = min;
    if (scaleRef.current < min) {
      scaleRef.current = min;
      setScale(min);
    }
  }

  function handleConfirm() {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const outputW = 1200;
    const outputH = 800;
    const previewW = container.clientWidth;
    const factor = outputW / previewW;

    const canvas = document.createElement("canvas");
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(outputW / 2 + panRef.current.x * factor, outputH / 2 + panRef.current.y * factor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scaleRef.current * factor, scaleRef.current * factor);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight);
    ctx.restore();

    onConfirm(canvas.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-zinc-950/96 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-black text-white/50 transition hover:text-white"
        >
          Cancel
        </button>
        <p className="text-sm font-black text-white">Adjust Cover</p>
        <button
          type="button"
          onClick={handleRotate}
          className="flex items-center gap-1.5 text-sm font-black text-white/50 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1 1 1.41 4.5M4.5 16.5V12h4.5" />
          </svg>
          Rotate
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-5">
        <div
          ref={containerRef}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-zinc-900"
          style={{ aspectRatio: "3/2", cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid overlay so user can see what's "outside" */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.14)",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "33.33% 33.33%",
            }}
          />
          <img
            ref={imgRef}
            src={src}
            alt=""
            onLoad={initScale}
            draggable={false}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) rotate(${rotation}deg) scale(${scale})`,
              transformOrigin: "center center",
              maxWidth: "none",
              userSelect: "none",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 px-5 py-6">
        <p className="text-xs font-semibold text-white/30">
          Drag to reposition · Scroll or pinch to zoom
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          className="h-12 w-full max-w-xs rounded-full bg-white text-sm font-black text-zinc-950 shadow-xl shadow-zinc-950/30 transition hover:bg-zinc-100"
        >
          Use Photo
        </button>
      </div>
    </div>
  );
}
