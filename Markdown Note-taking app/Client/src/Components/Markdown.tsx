import { useState, useEffect } from "react";
import TurndownService from "turndown";

interface TurndownProps {
  htmlContent: HTMLDivElement;
}

const Turndown = ({ htmlContent }: TurndownProps) => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!htmlContent) return;

    const turndownService = new TurndownService();
    const md = turndownService.turndown(htmlContent.innerHTML);
    setMarkdown(md);
  }, [htmlContent]);

  return <div id="markdown">{markdown}</div>;
};

export default Turndown;
