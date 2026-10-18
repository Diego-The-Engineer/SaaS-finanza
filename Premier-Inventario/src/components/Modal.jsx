import { createPortal } from 'react-dom';
export default function Modal({ children, style }) {
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content card" style={style}>
        {children}
      </div>
    </div>,
    document.body
  );
}
