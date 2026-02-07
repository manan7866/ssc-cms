"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function SaintsBulkUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("cms_token") || ""
      : "";

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  const handleFiles = useCallback((list: FileList | null) => {
    setFiles(list);
    setResults([]);
  }, []);

  const upload = useCallback(async () => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    setResults([]);
    const outcomes: { success: boolean; message: string }[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;
        
        try {
          const text = await file.text();
          const jsonData = JSON.parse(text);
          
          // Validate the data structure
          if (!Array.isArray(jsonData)) {
            outcomes.push({ 
              success: false, 
              message: `${file.name}: Data must be an array of saints` 
            });
            continue;
          }

          // Process each saint in the array
          for (const saint of jsonData) {
            // Validate required fields
            if (!saint.name) {
              outcomes.push({ 
                success: false, 
                message: `${file.name}: Missing required field 'name' for saint` 
              });
              continue;
            }

            try {
              const response = await axios.post(`${API_URL}/v1/sufi-saints`, saint, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.status >= 200 && response.status < 300) {
                outcomes.push({ 
                  success: true, 
                  message: `${file.name}: Successfully uploaded saint "${saint.name}"` 
                });
              } else {
                outcomes.push({ 
                  success: false, 
                  message: `${file.name}: Failed to upload saint "${saint.name}" - ${response.statusText}` 
                });
              }
            } catch (error: any) {
              outcomes.push({ 
                success: false, 
                message: `${file.name}: Error uploading saint "${saint.name}" - ${error.response?.data?.message || error.message}` 
              });
            }
          }
        } catch (error: any) {
          outcomes.push({ 
            success: false, 
            message: `${file.name}: Invalid JSON - ${error.message}` 
          });
        }
      }
    } finally {
      setResults(outcomes);
      setLoading(false);
      
      const successCount = outcomes.filter(r => r.success).length;
      const totalCount = outcomes.length;
      
      if (successCount === totalCount && totalCount > 0) {
        setStatus(`Successfully uploaded ${successCount} saint(s)`);
      } else if (successCount === 0) {
        setStatus("Upload failed for all items");
      } else {
        setStatus(`Partially successful: ${successCount}/${totalCount} saints uploaded`);
      }
    }
  }, [files, token, API_URL]);

  const exampleJson = JSON.stringify([
    {
      name: "Ala Hazrat",
      dates_raw: "1856-1921",
      period: "Modern Era",
      century: "19th Century",
      region: "India",
      summary: "Renowned Islamic scholar and poet",
      tags: ["scholar", "poet", "spiritual"]
    },
    {
      name: "Mujaddid Alf Sani",
      dates_raw: "1564-1624",
      period: "Medieval Period",
      century: "16th Century",
      region: "Indian Subcontinent",
      summary: "Reviver of the second millennium",
      tags: ["reformer", "scholar", "saint"]
    }
  ], null, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sufi Saints Bulk Upload</h1>
              <p className="text-gray-600 mt-2">Upload multiple saints using JSON format</p>
            </div>
            <Link
              href="/saints"
              className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Saints List
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload JSON Files
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select JSON files
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".json,application/json"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white px-4 py-2 rounded-lg shadow-md text-sm font-medium text-blue-600">
                  Click to browse files
                </div>
              </div>
            </div>
          </div>
          
          <button
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              loading || !files || files.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
            onClick={upload}
            disabled={loading || !files || files.length === 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Saints
              </>
            )}
          </button>
          
          {loading && (
            <div className="mt-4 flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Processing uploads...</span>
            </div>
          )}
          
          {status && (
            <div className={`mt-4 text-sm p-3 rounded-lg flex items-start gap-2 ${
              status.includes("Successfully") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : status.includes("Partially") 
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {status.includes("Successfully") ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : status.includes("Partially") ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{status}</span>
            </div>
          )}
          
          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Upload Results
              </h3>
              <div className="border rounded-lg max-h-96 overflow-y-auto bg-gray-50">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border-b last:border-b-0 text-sm flex items-start gap-3 ${
                      result.success 
                        ? "bg-green-50 text-green-800" 
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {result.success ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span>{result.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            JSON Format Guide
          </h2>
          <p className="text-gray-600 mb-4">
            Each JSON file should contain an array of saint objects with the following properties:
          </p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {exampleJson}
            </pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="mb-2 font-medium text-gray-800"><strong>Required fields:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">name</code> - The name of the saint</li>
            </ul>
            
            <p className="mt-3 mb-2 font-medium text-gray-800"><strong>Optional fields:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">dates_raw</code> - Raw date string (e.g., "1856-1921")</li>
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">period</code> - Historical period (e.g., "Medieval Period")</li>
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">century</code> - Century (e.g., "19th Century")</li>
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">region</code> - Geographic region (e.g., "India")</li>
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">summary</code> - Brief summary of the saint</li>
              <li><code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">tags</code> - Array of tag strings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}