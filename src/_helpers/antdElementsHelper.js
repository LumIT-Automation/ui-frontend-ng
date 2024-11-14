// AntdElementsHelper.js
import React, { forwardRef } from 'react';
import { Input, Checkbox, Select } from 'antd';

const { TextArea } = Input;

// Definisci il componente TextArea con forwardRef
const TextAreaHelper = forwardRef((props, ref) => (
  //<TextArea ref={ref} {...props} />
  <Input.TextArea
    rows={12}
    value={obj[key]}
    ref={ref => textAreaRefs[`${obj.id}_${key}`] = ref}
    onChange={event => set(key, event.target.value, obj)}
    style=
      { obj[`${key}Error`] ?
        {borderColor: `red`, width: 350}
      :
        {width: 350}
      }
  />
));

// Definisci il componente Input con forwardRef
const InputHelper = forwardRef((props, ref) => (
  <Input ref={ref} {...props} />
));

// Definisci il componente Checkbox con forwardRef
const CheckboxHelper = forwardRef((props, ref) => (
  <Checkbox ref={ref} {...props} />
));

// Definisci il componente Select con forwardRef
const SelectHelper = forwardRef((props, ref) => (
  <Select ref={ref} {...props} />
));

// Esporta tutti i componenti
export { TextAreaHelper, InputHelper, CheckboxHelper, SelectHelper };
