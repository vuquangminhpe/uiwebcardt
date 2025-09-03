"use client";

import { useState } from "react";
import CarDamageFlow from "./flow";
const modelsIndex = [
  { name: "small models" },
  { name: "small models v2" },
  { name: "medium models" },
  { name: "medium models version 2" },
  { name: "small models onnx" },
  { name: "small models onnx v2" },
  { name: "medium models onnx " },
  { name: "medium models onnx v2" },
];
export default function Home() {
  const [mode, setMode] = useState<"detection" | "compare">("detection");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [selectModels, setSelectModels] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [beforeResults, setBeforeResults] = useState<string[]>([]);
  const [afterResults, setAfterResults] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [beforePreviews, setBeforePreviews] = useState<string[]>([]);
  const [afterPreviews, setAfterPreviews] = useState<string[]>([]);

  const handleFileSelect = (
    file: File,
    section?: "before" | "after",
    index?: number
  ) => {
    if (section && index !== undefined) {
      if (section === "before") {
        const newFiles = [...beforeFiles];
        const newUrls = [...beforePreviews];

        newFiles[index] = file;
        newUrls[index] = URL.createObjectURL(file);

        setBeforeFiles(newFiles);
        setBeforePreviews(newUrls);
      } else {
        const newFiles = [...afterFiles];
        const newUrls = [...afterPreviews];

        newFiles[index] = file;
        newUrls[index] = URL.createObjectURL(file);

        setAfterFiles(newFiles);
        setAfterPreviews(newUrls);
      }
    } else {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const waitForImageReady = async (
    imagePath: string,
    maxRetries = 10
  ): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const imageResponse = await fetch(imagePath);
        if (imageResponse.ok) {
          return true;
        }
      } catch (error) {
        // Image not ready yet
      }
      // Wait 1 second before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
  };

  const handleDetection = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("select_models", selectModels.toString());
      const response = await fetch(
        "https://minh9972t12-yolocar.hf.space/detect",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const imagePath = `https://minh9972t12-yolocar.hf.space/${data.visualized_image_path}`;

      // Wait for image to be ready
      const imageReady = await waitForImageReady(imagePath);
      if (imageReady) {
        setResultImage(imagePath);
      } else {
        throw new Error("Image processing timeout");
      }
    } catch (error) {
      alert("Error processing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    const filledBeforeFiles = beforeFiles.filter((file) => file !== undefined);
    const filledAfterFiles = afterFiles.filter((file) => file !== undefined);

    if (filledBeforeFiles.length === 0 && filledAfterFiles.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();

      filledBeforeFiles.forEach((file, index) => {
        if (file) {
          formData.append(`before_${index + 1}`, file);
        }
      });

      filledAfterFiles.forEach((file, index) => {
        if (file) {
          formData.append(`after_${index + 1}`, file);
        }
      });
      formData.append("select_models", selectModels.toString());
      const response = await fetch(
        "https://minh9972t12-yolocar.hf.space/compare",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      // Extract visualization paths from position_results
      const beforeResults: string[] = [];

      if (data.position_results) {
        const imagePaths: string[] = [];

        data.position_results.forEach(
          (
            positionResult: { [key: string]: { visualization_path?: string } },
            index: number
          ) => {
            const positionKey = `position_${index + 1}`;
            if (positionResult[positionKey]?.visualization_path) {
              const fullPath = `https://minh9972t12-yolocar.hf.space/${positionResult[positionKey].visualization_path}`;
              imagePaths.push(fullPath);
            }
          }
        );

        // Wait for all images to be ready
        const imageReadyPromises = imagePaths.map((path) =>
          waitForImageReady(path)
        );
        const imageReadyResults = await Promise.all(imageReadyPromises);

        // Only add images that are ready
        imagePaths.forEach((path, index) => {
          if (imageReadyResults[index]) {
            beforeResults.push(path);
          }
        });
      }

      setBeforeResults(beforeResults);
      setAfterResults([]);
    } catch (error) {
      alert("Error processing images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-gray-50 dark:bg-gray-900 relative">
      <CarDamageFlow />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-gray-900 dark:text-white mb-4">
            Car Detection
          </h1>
        </div>
        <div className="text-center mb-12">
          <div className="flex gap-4">
            {modelsIndex.map((data, index) => (
              <button
                onClick={() => setSelectModels(index)}
                key={index}
                className={`px-6 py-2 rounded-full font-medium border transition-all shadow-sm focus:outline-none
                  ${
                    selectModels === index
                      ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400"
                  }
                `}
                style={{ minWidth: 140 }}
              >
                {data.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode("detection")}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                mode === "detection"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Detection Mode
            </button>
            <button
              onClick={() => setMode("compare")}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                mode === "compare"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Compare Mode
            </button>
          </div>
        </div>

        {mode === "detection" ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-8 text-center">
              Single Image Detection
            </h2>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileSelect(e.target.files[0])
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="image-upload"
                    />
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-64 object-contain mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-medium">
                          Click to upload image
                        </p>
                        <p className="text-sm">
                          Or drag and drop your image here
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDetection}
                  disabled={!selectedFile || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing image... Please wait (3-7s)
                    </>
                  ) : (
                    "Detect Vehicles"
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                  {resultImage ? (
                    <img
                      src={resultImage}
                      alt="Detection Result"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg">
                        Detection results will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-8 text-center">
              Image Comparison - Before & After
            </h2>

            <div className="space-y-12">
              {/* Before Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Before Images (6 images)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div key={`before-${index}`} className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        before_{index + 1}
                      </h4>
                      <div className="relative">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleFileSelect(
                                e.target.files[0],
                                "before",
                                index
                              )
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {beforePreviews[index] ? (
                            <img
                              src={beforePreviews[index]}
                              alt={`Before Preview ${index + 1}`}
                              className="max-w-full h-24 object-contain mx-auto rounded"
                            />
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                              <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </div>
                              <p className="text-sm">Upload</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* After Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  After Images (6 images)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div key={`after-${index}`} className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        after_{index + 1}
                      </h4>
                      <div className="relative">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleFileSelect(
                                e.target.files[0],
                                "after",
                                index
                              )
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {afterPreviews[index] ? (
                            <img
                              src={afterPreviews[index]}
                              alt={`After Preview ${index + 1}`}
                              className="max-w-full h-24 object-contain mx-auto rounded"
                            />
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                              <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </div>
                              <p className="text-sm">Upload</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCompare}
              disabled={
                (beforeFiles.filter((f) => f).length === 0 &&
                  afterFiles.filter((f) => f).length === 0) ||
                loading
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-xl transition-colors mb-8 mt-8 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing comparison... Please wait (5-10s)
                </>
              ) : (
                `Compare Images (Before: ${
                  beforeFiles.filter((f) => f).length
                }, After: ${afterFiles.filter((f) => f).length})`
              )}
            </button>

            {(beforeResults.length > 0 || afterResults.length > 0) && (
              <div className="space-y-12">
                {beforeResults.length > 0 && (
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 text-center">
                      Before Detection Results
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {beforeResults.map((result, index) => (
                        <div
                          key={`before-result-${index}`}
                          className="space-y-3"
                        >
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            before_{index + 1} result
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                            <img
                              src={result}
                              alt={`Before Result ${index + 1}`}
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {afterResults.length > 0 && (
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 text-center">
                      After Detection Results
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {afterResults.map((result, index) => (
                        <div
                          key={`after-result-${index}`}
                          className="space-y-3"
                        >
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            after_{index + 1} result
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                            <img
                              src={result}
                              alt={`After Result ${index + 1}`}
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
