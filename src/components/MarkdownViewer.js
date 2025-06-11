import React from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownViewer({ content }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
