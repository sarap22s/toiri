import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

export default function Sandbox({
  view,
  files,
}: {
  view: "preview" | "code";
  files: Record<string, { code: string; active?: boolean }>;
}) {
  return (
    <SandpackProvider
      key={view}
      template="react"
      theme={{
        colors: {
          surface1: "#0a0a0c",
          surface2: "#101015",
          surface3: "#16161d",
          clickable: "#6b6b7e",
          base: "#e7e7ee",
          disabled: "#3a3a4a",
          hover: "#ffffff",
          accent: "#7c5cff",
        },
        syntax: {
          plain: "#e7e7ee",
          comment: { color: "#5a5a6e", fontStyle: "italic" },
          keyword: "#9d84ff",
          tag: "#d4ff4f",
          punctuation: "#8b8b9e",
          definition: "#7cd4ff",
          property: "#9d84ff",
          static: "#d4ff4f",
          string: "#a3e635",
        },
        font: {
          body: '"Manrope", "Noto Sans Bengali", sans-serif',
          mono: '"JetBrains Mono", monospace',
          size: "13px",
          lineHeight: "1.6",
        },
      }}
      files={{
        "/styles.css": {
          code: "html,body,#root{margin:0;padding:0;background:#0a0a0c;color:#e7e7ee;}",
        },
        ...files,
      }}
    >
      <SandpackLayout style={{ height: "100%", border: "none" }}>
        {view === "preview" ? (
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height: "100%" }}
          />
        ) : (
          <SandpackCodeEditor showLineNumbers showTabs style={{ height: "100%" }} />
        )}
      </SandpackLayout>
    </SandpackProvider>
  );
}
