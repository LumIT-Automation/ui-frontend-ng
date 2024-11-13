import React, { useRef } from 'react';
import { Table } from 'antd';
import { TextAreaHelper, InputHelper, CheckboxHelper, SelectHelper } from './antdElementsHelper';

const MainComponent = () => {
  const inputRef = useRef(null);
  const checkboxRef = useRef(null);
  const selectRef = useRef(null);
  const textAreaRef = useRef(null);

  const columns = [
    {
      title: 'Text Input',
      dataIndex: 'textInput',
      key: 'textInput',
      render: () => <InputHelper ref={inputRef} placeholder="Input text" />
    },
    {
      title: 'Checkbox',
      dataIndex: 'checkbox',
      key: 'checkbox',
      render: () => <CheckboxHelper ref={checkboxRef} />
    },
    {
      title: 'Select',
      dataIndex: 'select',
      key: 'select',
      render: () => (
        <SelectHelper ref={selectRef} placeholder="Select an option">
          <SelectHelper.Option value="option1">Option 1</SelectHelper.Option>
          <SelectHelper.Option value="option2">Option 2</SelectHelper.Option>
        </SelectHelper>
      )
    },
    {
      title: 'Text Area',
      dataIndex: 'textArea',
      key: 'textArea',
      render: () => <TextAreaHelper ref={textAreaRef} placeholder="Enter text" />
    },
  ];

  const data = [
    { key: '1', textInput: '', checkbox: false, select: '', textArea: '' },
  ];

  return <Table columns={columns} dataSource={data} />;
};

export default MainComponent;
