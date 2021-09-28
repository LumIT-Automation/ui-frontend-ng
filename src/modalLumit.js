import React, { useState } from 'react';
import { Modal, Button, Space, Table, Link } from 'antd';

const ModalLumit = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisibletrue;
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Space>

        <a onClick={showModal}>
          {props.ps}
        </a>

      <Modal
        title={props.ps}
        visible={isModalVisible}
        closable={true}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={''}
        >
        <a href="https://www.lumit.it" target="_blank">Contattaci</a>
        <br/>
        <br/>
        <a href="https://desk.lumit.it/portal/it/signin" target="_blank">Apri un tiket</a>
      </Modal>
    </Space>
  );
};

export default ModalLumit
