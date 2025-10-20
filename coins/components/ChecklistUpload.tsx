"use client";
import { useState } from 'react';

export function ChecklistUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = () => {
    // Simulate processing
    console.log('Processing files:', uploadedFiles);
    alert('Files uploaded successfully! (This is a demo)');
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload Coin Data</h2>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-gold bg-gold/10' 
                : 'border-slate-700 hover:border-slate-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="text-4xl">📊</div>
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-slate-400 mt-1">
                  Supports Excel, CSV, PDF, Word documents
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <div className="text-3xl mb-2">📁</div>
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {file.type.includes('sheet') ? '📊' : 
                       file.type.includes('pdf') ? '📄' : 
                       file.type.includes('word') ? '📝' : '📁'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={processFiles}
                className="w-full rounded-md bg-gold px-4 py-2 font-medium text-black hover:opacity-90"
              >
                Process Files
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Expected Data Format</h2>
        <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6">
          <p className="text-slate-300 mb-4">
            Your spreadsheet should include columns for:
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-slate-400">
            <li>• Coin Name/Title</li>
            <li>• Year</li>
            <li>• Metal Type (Gold/Silver)</li>
            <li>• Weight</li>
            <li>• Purity</li>
            <li>• Condition/Grade</li>
            <li>• Mint Mark</li>
            <li>• Country of Origin</li>
            <li>• Purchase Price</li>
            <li>• Current Value</li>
            <li>• Notes/Description</li>
            <li>• Image URLs (optional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
