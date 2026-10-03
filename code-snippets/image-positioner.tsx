import React, { useRef, useState } from "react";

export type ImagePosition = {
  x: number;
  y: number;
  zoom: number;
};

type ImagePositionerProps = {
  imageSrc: string;
  imageAlt: string;
  aspectRatio: readonly [number, number];
  position: ImagePosition;
  onPositionChange: (position: ImagePosition) => void;
  onSave: (position: ImagePosition) => Promise<void>;
};

type DragOrigin = {
  pointerId: number;
  pointerX: number;
  pointerY: number;
  positionX: number;
  positionY: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const ImagePositionerShowcase: React.FC<ImagePositionerProps> = ({
  imageSrc,
  imageAlt,
  aspectRatio,
  position,
  onPositionChange,
  onSave,
}) => {
  const dragOrigin = useRef<DragOrigin | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    dragOrigin.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      positionX: position.x,
      positionY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;

    onPositionChange({
      ...position,
      x: origin.positionX + event.clientX - origin.pointerX,
      y: origin.positionY + event.clientY - origin.pointerY,
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragOrigin.current?.pointerId === event.pointerId) {
      dragOrigin.current = null;
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    onPositionChange({
      ...position,
      zoom: clamp(position.zoom - event.deltaY * 0.001, 0.2, 8),
    });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await onSave(position);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  return (
    <section>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${aspectRatio[0]} / ${aspectRatio[1]}`,
          overflow: "hidden",
          background: "#111",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          draggable={false}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            maxWidth: "none",
            maxHeight: "100%",
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${position.zoom})`,
            transformOrigin: "center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <button type="button" onClick={handleSave} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? "Enregistrement..." : "Enregistrer"}
        </button>
        <span role="status" aria-live="polite">
          {saveStatus === "saved" && "Configuration enregistrée"}
          {saveStatus === "error" && "Échec de l’enregistrement"}
        </span>
      </div>
    </section>
  );
};