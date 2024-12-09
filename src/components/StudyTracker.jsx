import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, X, BookOpen } from "lucide-react";
import dataJson from "./Data.json";

const StudyTracker = () => {
  // State initialization with localStorage
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("studyProgress");
    return savedData ? JSON.parse(savedData) : dataJson;
  });

  const [completedConcepts, setCompletedConcepts] = useState(() => {
    const saved = localStorage.getItem("completedConcepts");
    return saved ? JSON.parse(saved) : {};
  });

  const [expandedSections, setExpandedSections] = useState({});
  const [activeFlashcard, setActiveFlashcard] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // LocalStorage and Progress Updates
  useEffect(() => {
    localStorage.setItem("studyProgress", JSON.stringify(data));
    localStorage.setItem("completedConcepts", JSON.stringify(completedConcepts));
    calculateOverallProgress();
  }, [data, completedConcepts]);

  // Progress calculation
  const calculateOverallProgress = () => {
    let total = 0;
    let completed = 0;

    Object.entries(data).forEach(([topic, topicData]) => {
      Object.entries(topicData.sections).forEach(([section, sectionData]) => {
        const concepts = Object.keys(sectionData.concepts);
        total += concepts.length;
        completed += concepts.filter(
          concept => completedConcepts[`${topic}-${section}-${concept}`]
        ).length;
      });
    });

    setOverallProgress((completed / total) * 100);
  };

  // Basic handlers
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleConceptCompletion = (topic, section, concept) => {
    const key = `${topic}-${section}-${concept}`;
    setCompletedConcepts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const showFlashcard = (topic, section, concept) => {
    setActiveFlashcard({
      title: concept,
      data: data[topic].sections[section].concepts[concept]
    });
  };

  const resetProgress = () => {
    localStorage.removeItem("studyProgress");
    localStorage.removeItem("completedConcepts");
    setData(dataJson);
    setCompletedConcepts({});
  };

  // Components
  const ProgressBar = ({ percentage, small }) => (
    <div className={`bg-gray-100 rounded-full ${small ? 'h-2' : 'h-4'} w-full overflow-hidden`}>
      <div 
        className="bg-blue-500 h-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
      {!small && (
        <div className="text-center text-sm mt-1 text-gray-600">
          {Math.round(percentage)}% Complete
        </div>
      )}
    </div>
  );

  const FlashcardModal = ({ data, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">{data.title}</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {Object.entries(data.data).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <h4 className="font-semibold capitalize">{key.split('_').join(' ')}</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {Array.isArray(value) ? (
                  <ul className="space-y-2">
                    {value.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : typeof value === 'object' ? (
                  Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="mb-2">
                      <span className="font-medium">{subKey}:</span> {subValue}
                    </div>
                  ))
                ) : (
                  <div className="font-mono">{value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ConceptItem = ({ topic, section, concept, data, isCompleted }) => (
    <div 
      className={`
        p-3 rounded-lg border cursor-pointer
        ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50 border-gray-200'}
        transition-colors duration-200
      `}
      onClick={() => showFlashcard(topic, section, concept)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleConceptCompletion(topic, section, concept);
            }}
            className={`
              w-5 h-5 rounded border flex items-center justify-center
              transition-colors duration-200
              ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'}
            `}
          >
            {isCompleted && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className="font-medium">{concept}</span>
        </div>
        <BookOpen className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monetary Theory Study Tracker</h1>
        <button
          onClick={resetProgress}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset Progress
        </button>
      </div>

      <div className="mb-8">
        <ProgressBar percentage={overallProgress} />
      </div>

      <div className="space-y-6">
        {Object.entries(data).map(([topic, topicData]) => (
          <div key={topic} className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{topic}</h2>

            <div className="space-y-3">
              {Object.entries(topicData.sections).map(([section, sectionData]) => {
                const conceptCount = Object.keys(sectionData.concepts).length;
                const completedCount = Object.keys(sectionData.concepts).filter(
                  concept => completedConcepts[`${topic}-${section}-${concept}`]
                ).length;

                return (
                  <div key={section} className="border rounded-lg p-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(section)}
                    >
                      <div>
                        <h3 className="font-medium">{section}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {completedCount} of {conceptCount} completed
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <ProgressBar 
                            percentage={(completedCount/conceptCount) * 100} 
                            small 
                          />
                        </div>
                        {expandedSections[section] ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </div>
                    </div>

                    {expandedSections[section] && (
                      <div className="mt-3 space-y-2 pl-2">
                        {Object.entries(sectionData.concepts).map(([concept, conceptData]) => (
                          <ConceptItem
                            key={concept}
                            topic={topic}
                            section={section}
                            concept={concept}
                            data={conceptData}
                            isCompleted={completedConcepts[`${topic}-${section}-${concept}`]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activeFlashcard && (
        <FlashcardModal 
          data={activeFlashcard} 
          onClose={() => setActiveFlashcard(null)} 
        />
      )}
    </div>
  );
};

export default StudyTracker;