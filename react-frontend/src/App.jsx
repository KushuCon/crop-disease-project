import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// --- Reusable SVG Icon Components ---
const CheckIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>;
const UploadIcon = () => <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const AnalyzeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>;
const DownloadIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const RedoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
const SuccessIcon = () => <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>;


// --- Main App Component ---
export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size too large. Please upload an image smaller than 10MB.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    } else {
      setError('Please upload a valid image file (JPG, PNG, JPEG).');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setReportData(null);
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze_image', { method: 'POST', body: formData });
      if (!response.ok) throw new Error((await response.json()).error || 'Server error');
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!reportData) return;
    try {
      const response = await fetch('http://127.0.0.1:5000/generate_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AgriCare_Report_${reportData.disease_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setReportData(null);
    setIsLoading(false);
    setError('');
  };

  const cleanDiseaseName = reportData?.disease_name.replace(/___|__/g, ' ').replace(/_/g, ' ').trim();
  const formattedReport = reportData?.report_text
    .replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>')
    .replace(/^\* (.+)$/gm, '<div class="bullet-point">$1</div>');

  return (
    <div>
      <header className="header-animate sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="AgriCare AI Logo" className="h-10 w-10"/>
            <h1 className="text-3xl font-bold gradient-text">AgriCare AI</h1>
          </div>
        </div>
      </header>

      <section className="hero-bg text-white relative z-10">
        <div className="container mx-auto px-6 py-32 text-center relative">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 fade-in-up text-white">
            Identify Crop Diseases <span className="text-green-300">Instantly</span>
          </h2>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16 relative z-10 -mt-24">
        <div className="upload-card glass-card p-10 rounded-3xl shadow-2xl max-w-5xl mx-auto">
          
          {!reportData && !isLoading && (
            <div className="fade-in-up">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold mb-4 gradient-text">Get Your Free Analysis Report</h3>
                <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-4 rounded-full"></div>
              </div>
              
              {!preview ? (
                <div {...getRootProps()} className={`border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'drop-zone-hover' : ''}`}>
                  <input {...getInputProps()} />
                  <div className="float-animation">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <UploadIcon />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-700 mb-2">Upload Plant Image</h4>
                  <p className="text-xl font-medium text-gray-600">Drag & drop an image, or <span className="text-green-600 font-bold">click to select</span></p>
                </div>
              ) : (
                <div className="text-center fade-in-up">
                  <img src={preview} alt="Preview" className="max-h-96 rounded-2xl shadow-2xl border-4 border-white inline-block"/>
                  <div className="w-full flex justify-center items-center mt-8">
                    <button onClick={handleAnalyze} className="btn btn-primary text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-xl">
                      <span className="flex items-center space-x-2"><AnalyzeIcon /> <span>Analyze with AI</span></span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="text-center my-12 fade-in-up">
              <div className="bg-gray-100 inline-block p-8 rounded-2xl shadow-md">
                <div className="loader mx-auto mb-6"></div>
                <h4 className="text-2xl font-bold text-gray-700">AI Analysis in Progress...</h4>
                <p className="text-gray-500">Please wait a moment.</p>
              </div>
            </div>
          )}

          {reportData && !isLoading && (
            <div className="fade-in-up">
              <div className="text-center mb-8 success-animation">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><SuccessIcon /></div>
                <h2 className="text-4xl font-bold gradient-text mb-2">Analysis Complete!</h2>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border">
                <h3 className="text-2xl font-bold mb-6 text-center text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">🦠 Identified Disease: {cleanDiseaseName}</h3>
                <div id="report-content" dangerouslySetInnerHTML={{ __html: formattedReport }} />
              </div>
              <div className="text-center mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={handleDownload} className="btn btn-secondary text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-xl">
                  <span className="flex items-center space-x-2"><DownloadIcon /> <span>Download PDF Report</span></span>
                </button>
                <button onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl transition-all duration-300 border border-gray-300">
                  <span className="flex items-center space-x-2"><RedoIcon /> <span>Analyze Another</span></span>
                </button>
              </div>
            </div>
          )}

          {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-8 fade-in-up">{error}</div>}
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
            <p>&copy; 2025 AgriCare AI. A Final Year B.Tech Project.</p>
            <p className="text-sm text-gray-400 mt-1">Made with ❤️ for a greener future.</p>
        </div>
      </footer>
    </div>
  );
}
