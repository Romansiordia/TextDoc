import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Code, 
  Download, FileText, Printer,
  Sparkles, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, List, ListOrdered, Heading1, Heading2, Eraser,
  Image as ImageIcon, Minus, Square, Circle
} from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [fileName, setFileName] = useState('Documento_Sin_Titulo');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedHtml = localStorage.getItem('docsuite_html');
    const savedName = localStorage.getItem('docsuite_filename');
    
    if (savedName) setFileName(savedName);
    if (savedHtml && editorRef.current) {
      editorRef.current.innerHTML = savedHtml;
      setText(editorRef.current.innerText);
    }
    setIsLoaded(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    localStorage.setItem('docsuite_filename', e.target.value);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setText(e.currentTarget.innerText);
    localStorage.setItem('docsuite_html', e.currentTarget.innerHTML);
  };

  // Estadísticas de texto
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const readingTime = Math.ceil(wordCount / 200); // Promedio de 200 ppm

  // Manejador para aplicar formatos básicos
  const handleFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setText(editorRef.current.innerText);
      localStorage.setItem('docsuite_html', editorRef.current.innerHTML);
    }
  };

  const handleInsertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) {
      setText(editorRef.current.innerText);
      localStorage.setItem('docsuite_html', editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // The image can be quite large, so we constrain its max-width
        const imgHtml = `<img src="${imageUrl}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" alt="Imagen insertada" />`;
        handleInsertHTML(imgHtml);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Exportar el contenido
  const exportDocument = (format: 'txt' | 'doc' | 'html') => {
    if (!editorRef.current) return;
    
    let content = '';
    let mimeType = '';
    let extension = format;

    if (format === 'txt') {
      content = editorRef.current.innerText || text;
      mimeType = 'text/plain';
    } else if (format === 'doc' || format === 'html') {
      const htmlContent = editorRef.current.innerHTML;
      content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${fileName}</title></head>
        <body>${htmlContent}</body>
        </html>
      `;
      mimeType = format === 'doc' ? 'application/msword' : 'text/html';
    }

    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

  return (
    <div className="flex flex-col h-screen bg-slate-50 print:bg-white text-slate-900 print:text-black font-sans overflow-hidden print:overflow-visible print:h-auto">
      
      {/* HEADER / BARRA DE TÍTULO */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white print:hidden">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm shadow-blue-500/10">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={fileName}
              onChange={handleNameChange}
              className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none font-medium text-slate-800 text-sm transition-colors px-1 py-0.5 w-64"
              placeholder="Nombre del documento"
            />
            <span className="text-[11px] text-slate-500 px-1">Guardado localmente de forma automática</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs tracking-wide text-slate-700 font-medium px-4 py-2 rounded-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>IMPRIMIR</span>
          </button>
          
          <div className="relative group">
            <button className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs tracking-wide text-slate-700 font-medium px-4 py-2 rounded-md transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>EXPORTAR</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => exportDocument('txt')} className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer">Como .TXT</button>
              <button onClick={() => exportDocument('doc')} className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer">Como .DOC</button>
              <button onClick={() => exportDocument('html')} className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer">Como .HTML</button>
            </div>
          </div>
        </div>
      </header>

      {/* BARRA DE HERRAMIENTAS DE EDICIÓN */}
      <section className="flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-200 print:hidden">
        <div className="flex items-center space-x-1 bg-white p-1 rounded-md border border-slate-200 overflow-x-auto custom-scrollbar shadow-sm">
          <button onClick={() => handleFormat('undo')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Deshacer"><Undo className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('redo')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Rehacer"><Redo className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>
          
          <button onClick={() => handleFormat('formatBlock', 'H1')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Título 1"><Heading1 className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('formatBlock', 'H2')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Título 2"><Heading2 className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>
          
          <button onClick={() => handleFormat('bold')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Negrita"><Bold className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('italic')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Cursiva"><Italic className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('underline')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Subrayado"><Underline className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>
          
          <button onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Lista con viñetas"><List className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('insertOrderedList')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Lista numerada"><ListOrdered className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>
          
          <button onClick={() => handleFormat('formatBlock', 'PRE')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Bloque de Código"><Code className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('removeFormat')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Limpiar formato"><Eraser className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>
          
          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Insertar Imagen"><ImageIcon className="w-4 h-4" /></button>
          <button onClick={() => handleFormat('insertHorizontalRule')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Línea Horizontal"><Minus className="w-4 h-4" /></button>
          <button onClick={() => handleInsertHTML('&nbsp;&#9632;&nbsp;')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Insertar Cuadrado"><Square className="w-4 h-4" /></button>
          <button onClick={() => handleInsertHTML('&nbsp;&#9679;&nbsp;')} className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0" title="Insertar Círculo"><Circle className="w-4 h-4" /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>

          <select
            onChange={(e) => handleFormat('fontName', e.target.value)}
            className="bg-transparent text-slate-700 text-sm outline-none cursor-pointer py-1 px-2 hover:bg-slate-100 rounded transition-colors appearance-none flex-shrink-0"
            title="Fuente"
            defaultValue="sans-serif"
          >
            <option value="sans-serif" className="bg-white">Sans Serif</option>
            <option value="serif" className="bg-white">Serif</option>
            <option value="monospace" className="bg-white">Monospace</option>
            <option value="Arial" className="bg-white">Arial</option>
            <option value="Georgia" className="bg-white">Georgia</option>
            <option value="Courier New" className="bg-white">Courier New</option>
          </select>

          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>

          <select
            onChange={(e) => handleFormat('fontSize', e.target.value)}
            className="bg-transparent text-slate-700 text-sm outline-none cursor-pointer py-1 px-2 hover:bg-slate-100 rounded transition-colors appearance-none flex-shrink-0"
            title="Tamaño de letra"
            defaultValue="3"
          >
            <option value="1" className="bg-white">Muy pequeña (10pt)</option>
            <option value="2" className="bg-white">Pequeña (10pt)</option>
            <option value="3" className="bg-white">Normal (12pt)</option>
            <option value="4" className="bg-white">Mediana (14pt)</option>
            <option value="5" className="bg-white">Grande (18pt)</option>
            <option value="6" className="bg-white">Muy grande (24pt)</option>
            <option value="7" className="bg-white">Enorme (36pt)</option>
          </select>

          <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>

          <button 
            onClick={() => setAlignment('left')} 
            className={`p-1.5 rounded transition-colors cursor-pointer flex-shrink-0 ${alignment === 'left' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            title="Alinear a la izquierda"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setAlignment('center')} 
            className={`p-1.5 rounded transition-colors cursor-pointer flex-shrink-0 ${alignment === 'center' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            title="Centrar"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setAlignment('right')} 
            className={`p-1.5 rounded transition-colors cursor-pointer flex-shrink-0 ${alignment === 'right' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            title="Alinear a la derecha"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ÁREA DEL EDITOR (LIENZO DE TRABAJO) */}
      <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-50 print:bg-white print:p-0 print:block">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
        />
        <div className="w-full max-w-3xl min-h-[70vh] bg-white border border-slate-200 print:border-none rounded-xl print:rounded-none p-10 print:p-0 shadow-lg print:shadow-none focus-within:border-blue-500/50 focus-within:shadow-blue-500/10 transition-all duration-300 print:min-h-0">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className={`w-full min-h-[60vh] print:min-h-0 bg-transparent outline-none text-slate-800 print:text-black leading-relaxed text-base tracking-wide ${alignmentClass}`}
            placeholder="Comienza a redactar tu informe o análisis aquí..."
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          />
        </div>
      </main>

      {/* BARRA DE ESTADO / MÉTRICAS */}
      <footer className="flex items-center justify-between px-6 py-2 border-t border-slate-200 bg-white text-xs font-mono text-slate-500 print:hidden">
        <div className="flex items-center space-x-6">
          <span>Palabras: <strong className="text-blue-600">{wordCount}</strong></span>
          <span>Caracteres: <strong className="text-slate-700">{charCount}</strong></span>
          <span>Lectura: <strong className="text-slate-700">~{readingTime} min</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Workspace Clínico v1.0.0</span>
        </div>
      </footer>

    </div>
  );
}
