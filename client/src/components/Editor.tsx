interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  fontSize?: number;
}

export const Editor = ({ content, onChange, fontSize = 14 }: EditorProps) => {
  const lines = content.split("\n");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent =
        content.substring(0, start) + "    " + content.substring(end);
      onChange(newContent);
      // Set cursor position after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="relative h-full w-full bg-editor-bg font-mono text-editor-text">
      <div className="absolute left-0 top-0 flex h-full w-12 flex-col items-end border-r border-gray-700 bg-editor-bg py-4 pr-2">
        {lines.map((_, i) => (
          <div
            key={i}
            className="text-sm text-editor-line"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize + 10}px`,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-full w-full resize-none bg-transparent pl-14 pr-4 pt-4 font-mono text-sm outline-none"
        spellCheck="false"
        style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize + 10}px` }}
      />
    </div>
  );
};
