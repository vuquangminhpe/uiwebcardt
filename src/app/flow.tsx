/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Camera,
  Eye,
  GitBranch,
  BarChart3,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

type CaseKey = "case1" | "case2" | "case3";

const CarDamageFlow = () => {
  const [selectedCase, setSelectedCase] = useState<CaseKey>("case2");
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      id: "upload",
      title: "Upload Images",
      icon: Camera,
      details: ["6 Before positions - 6 After positions"],
      y: 80,
    },
    {
      id: "detection",
      title: "YOLOv12 Detection",
      icon: Eye,
      details: [
        "Process all 12 images",
        "Extract bounding boxes",
        "Confidence filtering",
      ],
      y: 180,
    },
    {
      id: "reid",
      title: "ReID Deduplication",
      icon: GitBranch,
      details: ["Cross-view matching", "CLIP features", "Remove duplicates"],
      y: 280,
    },
    {
      id: "comparison",
      title: "Before/After Analysis",
      icon: BarChart3,
      details: ["Match damages", "Find new/repaired", "Calculate statistics"],
      y: 380,
    },
    {
      id: "decision",
      title: "Case Decision",
      icon: FileCheck,
      details: ["Determine final case", "Generate report"],
      y: 480,
    },
  ];

  const cases = {
    case1: {
      name: "EXISTING DAMAGE",
      color: "#f59e0b",
      icon: AlertTriangle,
      message: "Pre-existing → Delivery OK",
      branchX: 200,
    },
    case2: {
      name: "NEW DAMAGE",
      color: "#ef4444",
      icon: XCircle,
      message: "New damage detected!",
      branchX: 350,
    },
    case3: {
      name: "SUCCESS",
      color: "#10b981",
      icon: CheckCircle,
      message: "No damage found",
      branchX: 500,
    },
  };

  // Auto animation through steps
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 5) {
          // Include branch step
          return 0;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getBallPosition = () => {
    if (currentStep < 5) {
      // Moving through main flow
      return {
        x: 350,
        y: currentStep < steps.length ? steps[currentStep].y : 530,
      };
    } else {
      // Moving to selected branch
      return {
        x: cases[selectedCase].branchX,
        y: 580,
      };
    }
  };

  const ballPos = getBallPosition();
  const currentCase = cases[selectedCase];

  type StepKey = "upload" | "detection" | "reid" | "comparison" | "decision";
  type StatsKey = "detection" | "reid" | "comparison" | "decision";

  const getStepStats = (stepIndex: number) => {
    const stats: Record<CaseKey, Record<StatsKey, string>> = {
      case1: {
        detection: "12 total detections",
        reid: "2 unique damages",
        comparison: "2 before, 2 after",
        decision: "0 new damages",
      },
      case2: {
        detection: "18 total detections",
        reid: "4 unique damages",
        comparison: "1 before, 3 after",
        decision: "2 new damages",
      },
      case3: {
        detection: "0 total detections",
        reid: "0 unique damages",
        comparison: "0 before, 0 after",
        decision: "0 new damages",
      },
    };

    const stepKeys: StepKey[] = [
      "upload",
      "detection",
      "reid",
      "comparison",
      "decision",
    ];
    const stepKey = stepKeys[stepIndex];
    if (["detection", "reid", "comparison", "decision"].includes(stepKey)) {
      return (
        stats[selectedCase][stepKey as StatsKey] ||
        steps[stepIndex]?.details[0] ||
        ""
      );
    }
    return steps[stepIndex]?.details[0] || "";
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-800 via-purple-500 to-slate-800 p-8">
      <div className="absolute top-20 font-bold right-20 max-w-[200px] bg-gray-100 p-3 rounded-xl">
        If anything else changes, I will continue to update the cases, mainly
        filters.
      </div>
      <div className="max-w-6xl mx-auto">
        {/* Main Flow Container */}
        <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 mb-6">
          <svg
            width="100%"
            height="650"
            viewBox="0 0 700 650"
            className="overflow-visible"
          >
            {/* Main Vertical Flow Line */}
            <line
              x1="350"
              y1="50"
              x2="350"
              y2="500"
              stroke="#64748b"
              strokeWidth="3"
              strokeDasharray="5,5"
            />

            {/* Branch Lines from Decision Point */}
            <g
              opacity={currentStep >= 5 ? 1 : 0.3}
              className="transition-opacity duration-500"
            >
              {/* To Case 1 */}
              <line
                x1="350"
                y1="500"
                x2={cases.case1.branchX}
                y2="580"
                stroke={cases.case1.color}
                strokeWidth="3"
              />
              {/* To Case 2 */}
              <line
                x1="350"
                y1="500"
                x2={cases.case2.branchX}
                y2="580"
                stroke={cases.case2.color}
                strokeWidth="3"
              />
              {/* To Case 3 */}
              <line
                x1="350"
                y1="500"
                x2={cases.case3.branchX}
                y2="580"
                stroke={cases.case3.color}
                strokeWidth="3"
              />
            </g>

            {/* Step Circles */}
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === index;
              const isPassed = currentStep > index;

              return (
                <g key={step.id}>
                  {/* Step Circle */}
                  <circle
                    cx="350"
                    cy={step.y}
                    r="30"
                    fill={
                      isActive
                        ? currentCase.color
                        : isPassed
                        ? "#475569"
                        : "#334155"
                    }
                    stroke={isActive ? currentCase.color : "#64748b"}
                    strokeWidth="3"
                    className={`transition-all duration-500 ${
                      isActive ? "drop-shadow-lg" : ""
                    }`}
                  />

                  {/* Step Icon - Fixed positioning */}
                  <foreignObject x="342" y={step.y - 8} width="16" height="16">
                    <div className="flex items-center justify-center w-full h-full">
                      <StepIcon
                        className={`w-4 h-4 ${
                          isActive || isPassed ? "text-white" : "text-slate-400"
                        }`}
                      />
                    </div>
                  </foreignObject>

                  {/* Step Label */}
                  <text
                    x="400"
                    y={step.y - 5}
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                    className={isActive ? "opacity-100" : "opacity-70"}
                  >
                    {step.title}
                  </text>

                  {/* Step Details */}
                  <text x="400" y={step.y + 15} fill="#94a3b8" fontSize="12">
                    {isActive ? getStepStats(index) : step.details[0]}
                  </text>
                </g>
              );
            })}

            {/* Case End Points */}
            {Object.entries(cases).map(([key, caseData]) => {
              const CaseIcon = caseData.icon;
              const isSelected = selectedCase === key;

              return (
                <g key={key} opacity={currentStep >= 5 ? 1 : 0.3}>
                  {/* Case Circle */}
                  <circle
                    cx={caseData.branchX}
                    cy="580"
                    r="35"
                    fill={caseData.color}
                    stroke={isSelected ? "#ffffff" : "none"}
                    strokeWidth="3"
                    className={`transition-all duration-300 ${
                      isSelected ? "drop-shadow-xl" : ""
                    }`}
                  />

                  {/* Case Icon - Fixed positioning */}
                  <foreignObject
                    x={caseData.branchX - 10}
                    y="572"
                    width="20"
                    height="16"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <CaseIcon className="w-5 h-5 text-white" />
                    </div>
                  </foreignObject>

                  {/* Case Label - Increased spacing */}
                  <text
                    x={caseData.branchX}
                    y="635"
                    textAnchor="middle"
                    fill={caseData.color}
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {caseData.name}
                  </text>
                </g>
              );
            })}

            {/* Animated Ball - Simplified */}
            <circle
              cx={ballPos.x}
              cy={ballPos.y}
              r="10"
              fill={currentCase.color}
              className="drop-shadow-lg transition-all duration-1000 ease-in-out"
            />
            <circle
              cx={ballPos.x}
              cy={ballPos.y}
              r="6"
              fill="white"
              opacity="0.9"
              className="transition-all duration-1000 ease-in-out"
            />

            {/* Current Step Info Box */}
            {currentStep < 5 && (
              <foreignObject x="50" y={ballPos.y - 30} width="250" height="60">
                <div className="bg-slate-700/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
                  <div className="text-white font-medium text-sm">
                    {steps[currentStep]?.title}
                  </div>
                  <div className="text-slate-300 text-xs mt-1">
                    {getStepStats(currentStep)}
                  </div>
                </div>
              </foreignObject>
            )}
          </svg>
        </div>

        {/* Case Selectors */}
        <div className="flex justify-center gap-4 mb-6">
          {Object.entries(cases).map(([key, data]) => {
            const IconComponent = data.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCase(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedCase === key
                    ? "bg-white/20 text-black scale-105"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                }`}
                style={{
                  borderLeft:
                    selectedCase === key ? `4px solid ${data.color}` : "none",
                }}
              >
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: data.color }}
                />
                <span className="text-sm font-medium">{data.name}</span>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isAnimating
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isAnimating ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setCurrentStep(0)}
            className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-all duration-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDamageFlow;
