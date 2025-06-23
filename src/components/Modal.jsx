import React, { useEffect } from 'react';

function Modal({ isOpen, onClose, children, anchorRef }) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);
  if (!isOpen) return null;

  // Si se pasa anchorRef, posicionar el modal sobre ese elemento
  let modalStyle = {
    position: 'fixed',
    zIndex: 10000, // refuerzo z-index
    background: 'rgba(0,0,0,0.45)',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    minWidth: '100vw',
  };
  let contentStyle = {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: 512,
    maxHeight: 'calc(100vh - 48px)',
    overflowY: 'auto',
    position: 'relative',
    padding: 24,
    zIndex: 10001,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  if (anchorRef && anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    contentStyle.top = rect.bottom + window.scrollY + 8;
    contentStyle.left = rect.left + window.scrollX;
    contentStyle.width = rect.width;
    contentStyle.position = 'absolute';
    contentStyle.margin = 0;
    contentStyle.transform = 'none';
  } else {
    // fallback: centrado vertical
    contentStyle.top = '50%';
    contentStyle.left = '50%';
    contentStyle.transform = 'translate(-50%, -50%)';
    contentStyle.position = 'fixed';
  }

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button
          style={{position:'absolute', top:12, right:12, color:'#9ca3af', fontWeight:'bold', fontSize:24, background:'none', border:'none', cursor:'pointer', zIndex:10002}}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
