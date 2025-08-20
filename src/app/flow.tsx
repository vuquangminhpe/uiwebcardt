/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

const CarDamageFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Main flow steps
  const mainSteps = [
    {
      id: "upload",
      title: "Upload Images",
      icon: Camera,
      details: ["6 Before positions - 6 After positions"],
      y: 100,
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
      y: 240,
    },
    {
      id: "reid",
      title: "ReID Deduplication",
      icon: GitBranch,
      details: ["Cross-view matching", "CLIP features", "Remove duplicates"],
      y: 380,
    },
  ];

  const cases = {
    case1: {
      name: "EXISTING DAMAGE",
      color: "#f59e0b",
      icon: AlertTriangle,
      branchX: 200,
    },
    case2: {
      name: "NEW DAMAGE",
      color: "#ef4444",
      icon: XCircle,
      branchX: 350,
    },
    case3: {
      name: "SUCCESS",
      color: "#10b981",
      icon: CheckCircle,
      branchX: 500,
    },
  } as const;

  const branchSteps = [
    {
      id: "comparison",
      title: "Before/After Analysis",
      icon: BarChart3,
      y: 650,
    },
    { id: "decision", title: "Case Decision", icon: FileCheck, y: 830 }, // Tăng từ 740 lên 830
  ];

  const mergeSteps = [
    {
      id: "analysis_all",
      title: "Analysis All Images",
      icon: BarChart3,
      y: 1010,
    },
    { id: "final_decision", title: "Final Decision", icon: FileCheck, y: 1190 }, // Tăng từ 1100 lên 1190
  ];

  // Animation states
  const [branchProgress, setBranchProgress] = useState({
    case1: 0,
    case2: 0,
    case3: 0,
  });

  useEffect(() => {
    if (!isAnimating) return;

    let interval: NodeJS.Timeout;

    // Main flow
    if (currentStep < mainSteps.length) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev + 1 === mainSteps.length) {
            setBranchProgress({ case1: 0, case2: 0, case3: 0 });
          }
          return Math.min(prev + 1, mainSteps.length);
        });
      }, 2000);
    } else if (currentStep === mainSteps.length) {
      interval = setInterval(() => {
        setBranchProgress((prev) => {
          const updated = { ...prev };
          (Object.keys(updated) as (keyof typeof updated)[]).forEach((k) => {
            if (updated[k] < branchSteps.length) updated[k] += 1;
          });

          if (
            updated.case1 === branchSteps.length &&
            updated.case2 === branchSteps.length &&
            updated.case3 === branchSteps.length
          ) {
            clearInterval(interval);

            setTimeout(() => {
              setCurrentStep(mainSteps.length + 1);
            }, 1000);
          }

          return updated;
        });
      }, 2000);
    } else if (currentStep === mainSteps.length + 1) {
      setBranchProgress({ case1: 0, case2: 0, case3: 0 });

      const timeout = setTimeout(() => {
        setCurrentStep(mainSteps.length + 2);
      }, 2000);

      return () => clearTimeout(timeout);
    } else if (currentStep === mainSteps.length + 2) {
      const timeout = setTimeout(() => {
        setCurrentStep(0);
        setBranchProgress({ case1: 0, case2: 0, case3: 0 });
      }, 2000);

      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnimating, currentStep]);

  const MovingBall = ({
    x1,
    y1,
    x2,
    y2,
    color,
    duration = 1.2,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    duration?: number;
  }) => (
    <motion.circle
      r="8"
      fill={color}
      animate={{ x: [x1, x2], y: [y1, y2] }}
      transition={{ duration, ease: "easeInOut" }}
    />
  );

  const renderMainFlow = () => {
    const verticalSegments = [
      { from: mainSteps[0].y, to: mainSteps[1].y, when: 1 },
      { from: mainSteps[1].y, to: mainSteps[2].y, when: 2 },
    ];

    return (
      <>
        <line
          x1="350"
          y1="60"
          x2="350"
          y2="380"
          stroke="#64748b"
          strokeWidth="3"
          strokeDasharray="5,5"
        />

        {mainSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === index;
          const isPassed = currentStep > index;

          return (
            <g key={step.id}>
              <circle
                cx="350"
                cy={step.y}
                r="35"
                fill={isActive ? "#6366f1" : isPassed ? "#475569" : "#334155"}
                stroke={isActive ? "#6366f1" : "#64748b"}
                strokeWidth="3"
              />
              <foreignObject x="342" y={step.y - 8} width="16" height="16">
                <div className="flex items-center justify-center w-full h-full">
                  <StepIcon
                    className={`w-4 h-4 ${
                      isActive || isPassed ? "text-white" : "text-slate-400"
                    }`}
                  />
                </div>
              </foreignObject>
              <text
                x="420"
                y={step.y}
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {step.title}
              </text>

              {isActive && (
                <foreignObject x="50" y={step.y - 48} width="260" height="96">
                  <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600 shadow">
                    <div className="text-white font-semibold text-sm mb-1">
                      {step.title}
                    </div>
                    <ul className="text-slate-300 text-xs list-disc pl-4 space-y-1">
                      {step.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {Object.entries(cases).map(([key, c]) => (
          <g key={key}>
            <line
              x1="350"
              y1="415"
              x2={c.branchX}
              y2="515"
              stroke={c.color}
              strokeWidth="3"
            />
            {currentStep === mainSteps.length && (
              <MovingBall
                x1={350}
                y1={415}
                x2={c.branchX}
                y2={515}
                color={c.color}
              />
            )}
          </g>
        ))}

        {verticalSegments.map((seg, i) =>
          currentStep === seg.when ? (
            <MovingBall
              key={i}
              x1={350}
              y1={seg.from}
              x2={350}
              y2={seg.to}
              color="#6366f1"
            />
          ) : null
        )}
      </>
    );
  };

  const renderBranches = () => {
    return (
      Object.entries(cases) as Array<
        readonly [keyof typeof cases, (typeof cases)[keyof typeof cases]]
      >
    ).map(([key, c]) => (
      <g key={String(key)}>
        <circle cx={c.branchX} cy="550" r="30" fill={c.color} />{" "}
        <foreignObject x={c.branchX - 8} y="542" width="16" height="16">
          {" "}
          <div className="flex items-center justify-center w-full h-full">
            <c.icon className="w-4 h-4 text-white" />
          </div>
        </foreignObject>
        <text
          x={c.branchX}
          y="590"
          textAnchor="middle"
          fill={c.color}
          fontSize="14"
          fontWeight="bold"
        >
          {c.name}
        </text>
        <line
          x1={c.branchX}
          y1="585"
          x2={c.branchX}
          y2={branchSteps[0].y - 30}
          stroke={c.color}
          strokeWidth="2"
        />
        {branchSteps.map((step, i) => {
          const StepIcon = step.icon;
          const progress = branchProgress[key];
          const isActive =
            progress === i + 1 && currentStep === mainSteps.length;

          return (
            <g key={`${String(key)}_${step.id}`}>
              <line
                x1={c.branchX}
                y1={i === 0 ? 585 : branchSteps[i - 1].y + 30}
                x2={c.branchX}
                y2={step.y - 30}
                stroke={c.color}
                strokeWidth="2"
              />
              {isActive && (
                <MovingBall
                  x1={c.branchX}
                  y1={i === 0 ? 585 : branchSteps[i - 1].y + 30}
                  x2={c.branchX}
                  y2={step.y}
                  color={c.color}
                />
              )}
              <circle
                cx={c.branchX}
                cy={step.y}
                r="30"
                fill={isActive || progress > i + 1 ? c.color : "#334155"} // Đã hoàn thành thì giữ màu
                stroke={c.color}
                strokeWidth="3"
              />
              <foreignObject
                x={c.branchX - 8}
                y={step.y - 8}
                width="16"
                height="16"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <StepIcon
                    className={
                      isActive || progress > i + 1
                        ? "w-4 h-4 text-white"
                        : "w-4 h-4 text-slate-400"
                    }
                  />
                </div>
              </foreignObject>
              <text
                x={c.branchX}
                y={step.y + 45}
                textAnchor="middle"
                fill={c.color}
                fontSize="12"
              >
                {step.title}
              </text>
            </g>
          );
        })}
      </g>
    ));
  };

  const renderMerge = () => {
    const analysis = mergeSteps[0];
    const final = mergeSteps[1];

    const analysisIndex = mainSteps.length + 1;
    const finalIndex = analysisIndex + 1;

    const isActiveAnalysis = currentStep === analysisIndex;
    const isActiveFinal = currentStep === finalIndex;

    return (
      <g>
        <line
          x1="200"
          y1={branchSteps[branchSteps.length - 1].y + 30}
          x2="350"
          y2={analysis.y - 35}
          stroke="#64748b"
          strokeWidth="2"
        />
        <line
          x1="350"
          y1={branchSteps[branchSteps.length - 1].y + 30}
          x2="350"
          y2={analysis.y - 35}
          stroke="#64748b"
          strokeWidth="2"
        />
        <line
          x1="500"
          y1={branchSteps[branchSteps.length - 1].y + 30}
          x2="350"
          y2={analysis.y - 35}
          stroke="#64748b"
          strokeWidth="2"
        />

        {isActiveAnalysis && (
          <MovingBall
            x1={350}
            y1={analysis.y - 35}
            x2={350}
            y2={analysis.y}
            color="#6366f1"
          />
        )}

        <circle
          cx="350"
          cy={analysis.y}
          r="35"
          fill={isActiveAnalysis ? "#6366f1" : "#334155"}
          stroke="#6366f1"
          strokeWidth="3"
        />
        <foreignObject x="342" y={analysis.y - 8} width="16" height="16">
          <div className="flex items-center justify-center w-full h-full">
            <analysis.icon
              className={
                isActiveAnalysis
                  ? "w-4 h-4 text-white"
                  : "w-4 h-4 text-slate-400"
              }
            />
          </div>
        </foreignObject>
        <text
          x="420"
          y={analysis.y}
          fill="white"
          fontSize="16"
          fontWeight="bold"
        >
          {analysis.title}
        </text>

        <line
          x1="350"
          y1={analysis.y + 35}
          x2="350"
          y2={final.y - 35}
          stroke="#64748b"
          strokeWidth="2"
        />

        {isActiveFinal && (
          <MovingBall
            x1={350}
            y1={analysis.y + 35}
            x2={350}
            y2={final.y}
            color="#6366f1"
          />
        )}

        <circle
          cx="350"
          cy={final.y}
          r="35"
          fill={isActiveFinal ? "#6366f1" : "#334155"}
          stroke="#6366f1"
          strokeWidth="3"
        />
        <foreignObject x="342" y={final.y - 8} width="16" height="16">
          <div className="flex items-center justify-center w-full h-full">
            <final.icon
              className={
                isActiveFinal ? "w-4 h-4 text-white" : "w-4 h-4 text-slate-400"
              }
            />
          </div>
        </foreignObject>
        <text x="420" y={final.y} fill="white" fontSize="16" fontWeight="bold">
          {final.title}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-800 via-purple-500 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 mb-6">
          <svg
            width="100%"
            height="1400"
            viewBox="0 0 700 1400"
            className="overflow-visible"
          >
            {renderMainFlow()}
            {renderBranches()}
            {renderMerge()}
          </svg>
        </div>

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
            onClick={() => {
              setCurrentStep(0);
              setBranchProgress({ case1: 0, case2: 0, case3: 0 });
            }}
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
