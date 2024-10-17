import React, { useState } from 'react';
import { Modal } from 'antd';
import ReactJson from 'react-json-view';

const JsonModal = ({ jsonObject, isVisible, handleClose, vendor }) => {
  const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Modal
      title={<div style={{ textAlign: 'center' }}>{capitalizeFirstLetter(vendor)} Documentation</div>}
      visible={isVisible}
      onOk={handleClose}
      onCancel={handleClose}
      width={800} // Personalizza la dimensione della modale
    >
      <ReactJson
        src={jsonObject}
        theme="monokai" // Scegli un tema
        collapsed={1} // Collassa fino al primo livello
        enableClipboard={true} // Abilita la copia negli appunti
        displayDataTypes={false} // Nasconde i tipi di dati
        displayObjectSize={true} // Mostra la dimensione degli oggetti
      />
    </Modal>
  );
};

export default JsonModal;
