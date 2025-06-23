import React from 'react';
import ReactDOM from 'react-dom';
import Modal from './Modal';

function PortalModal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

export default PortalModal;
