import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export const YamlEditor = ({ initialYaml, onYamlChange }) => {
  const [yamlContent, setYamlContent] = useState(initialYaml || '');

  const handleEditorChange = (value) => {
    setYamlContent(value);
    onYamlChange?.(value.toString()); 
  };

  return (
    <div style={{ height: '500px', border: '1px solid #ddd' }}>
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={yamlContent}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

