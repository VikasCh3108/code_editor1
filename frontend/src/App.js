import React, { useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

function App() {
  const [code, setCode] = useState("print('Hello, world!')");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const termRef = useRef(null);

  // Inspect code for active input() or raw_input() calls (not in comments/strings, not inside function/class)
  function hasTopLevelInput(code) {
    // Remove comments
    let codeNoComments = code.replace(/#.*/g, "");
    // Remove strings (single, double, triple)
    codeNoComments = codeNoComments.replace(/(['"]{3}[\s\S]*?['"]{3}|(['"])(?:\\.|[^\\])*?\2)/g, "");
    // Split into lines
    const lines = codeNoComments.split('\n');
    let inBlock = false;
    for (let line of lines) {
      const trimmed = line.trim();
      // Detect start/end of function or class
      if (/^(def |class )/.test(trimmed)) inBlock = true;
      if (inBlock && /^\S/.test(line)) inBlock = false; // dedent
      // If not in a block, look for input/raw_input
      if (!inBlock && /\b(input|raw_input)\s*\(/.test(trimmed)) return true;
    }
    return false;
  }

  // Inspect code on submit as well, not just on edit
  const inspectCodeForInput = (code) => {
    return code && hasTopLevelInput(code);
  };

  const handleEditorChange = (value) => {
    setCode(value);
    if (inspectCodeForInput(value)) {
      setShowInput(true);
    } else {
      setShowInput(false);
      setUserInput("");
    }
  };

  const handleSubmit = async () => {
    setOutput("");
    setError("");
    setLoading(true);
    if (termRef.current) {
      termRef.current.clear();
    }
    // Inspect code before sending
    const needsInput = inspectCodeForInput(code);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "/api/execute/";
      const response = await axios.post(apiUrl, {
        code,
        language: "python",
        stdin: needsInput ? userInput : undefined
      });
      setOutput(response.data.output);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : "Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!termRef.current && document.getElementById("terminal")) {
      termRef.current = new Terminal();
      termRef.current.open(document.getElementById("terminal"));
    }
    return () => {
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (termRef.current && output !== undefined && output !== null) {
      try {
        termRef.current.clear();
        termRef.current.write(output.replace(/\n/g, "\r\n"));
      } catch (e) {
        // Ignore terminal errors
      }
    }
  }, [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <MonacoEditor
          height="50vh"
          defaultLanguage="python"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
        />
      </div>
      {showInput && (
        <div style={{ margin: "10px 0" }}>
          <label htmlFor="userInput" style={{ color: "#fff" }}>
            Program Input (for input()): <span style={{fontWeight:'normal',fontSize:'0.9em'}}>(one line per input)</span>
          </label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            rows={Math.max(2, userInput.split('\n').length)}
            style={{ width: "100%", padding: "8px", marginTop: "5px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #333", resize: "vertical" }}
            placeholder="Enter input for your code here, one line per input() call"
          />
        </div>
      )}
      <button onClick={handleSubmit} style={{ margin: "10px 0", padding: "10px" }} disabled={loading}>
        {loading ? "Running..." : "Run Code"}
      </button>
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}
      <div id="terminal" style={{ flex: 1, background: "#111", color: "#fff", padding: "10px", minHeight: "200px" }}></div>
    </div>
  );
}

export default App;
