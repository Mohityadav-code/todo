import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import dataJson from "./Data.json";

const StudyTracker = () => {
    // Initialize state with data from localStorage if it exists, otherwise use initialData
    const [data, setData] = useState(() => {
      const savedData = localStorage.getItem("studyProgress");
      return savedData ? JSON.parse(savedData) : dataJson;
    });
    
    const [expandedSections, setExpandedSections] = useState({});
    const [activeFlashcard, setActiveFlashcard] = useState(null);
    const [overallProgress, setOverallProgress] = useState(0);
  
    // Calculate progress whenever data changes
    useEffect(() => {
      calculateOverallProgress();
    }, [data]);
  
    // Separate useEffect for local storage updates
    useEffect(() => {
      try {
        localStorage.setItem("studyProgress", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }
    }, [data]);
  
    const calculateOverallProgress = () => {
      try {
        let totalSections = 0;
        let completedSections = 0;
  
        Object.values(data).forEach((topic) => {
          Object.values(topic.sections).forEach((section) => {
            totalSections++;
            if (section.completed) completedSections++;
          });
        });
  
        setOverallProgress((completedSections / totalSections) * 100);
      } catch (error) {
        console.error("Error calculating progress:", error);
        setOverallProgress(0);
      }
    };
  
    // Add a reset function in case data gets corrupted
    const resetProgress = () => {
      try {
        localStorage.removeItem("studyProgress");
        setData(dataJson);
        calculateOverallProgress();
      } catch (error) {
        console.error("Error resetting progress:", error);
      }
    };
  
    // Update the toggleCompletion function to be more robust
    const toggleCompletion = (topicKey, sectionKey) => {
      try {
        setData((prevData) => {
          const newData = JSON.parse(JSON.stringify(prevData));
          const topic = newData[topicKey];
          const section = topic.sections[sectionKey];
  
          section.completed = !section.completed;
          topic.completed = Object.values(topic.sections).every(
            (section) => section.completed
          );
  
          // Immediately save to localStorage
          localStorage.setItem("studyProgress", JSON.stringify(newData));
          return newData;
        });
      } catch (error) {
        console.error("Error toggling completion:", error);
      }
    };
  
    // Add error boundary to your JSX
    if (!data) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Error Loading Data</h1>
          <button 
            onClick={resetProgress}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Progress
          </button>
        </div>
      );
    }

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
          ...prev,
          [section]: !prev[section],
        }));
      };

  const showFlashcard = (topic, section, concept) => {
    setActiveFlashcard({
      title: concept,
      data: data[topic].sections[section].concepts[concept],
    });
  };

  // Progress Bar Component
  const ProgressBar = ({ percentage }) => (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
      <div
        className="bg-blue-500 h-4 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="text-center mt-2 text-sm text-gray-600">
        {Math.round(percentage)}% Complete
      </div>
    </div>
  );

  // Flashcard Component
// Updated FlashcardModal Component
const FlashcardModal = ({ flashcard, onClose }) => {
    // Helper function to render arrays or objects
    const renderContent = (content) => {
      if (Array.isArray(content)) {
        return (
          <ul className="list-disc pl-5 space-y-2">
            {content.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      } else if (typeof content === 'object') {
        return Object.entries(content).map(([key, value]) => (
          <div key={key} className="ml-4 mt-2">
            <span className="font-semibold">{key}: </span>
            {typeof value === 'string' ? (
              <span>{value}</span>
            ) : (
              renderContent(value)
            )}
          </div>
        ));
      }
      return <div className="text-lg font-mono">{content}</div>;
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{flashcard.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>
          </div>
  
          <div className="space-y-6">
            {Object.entries(flashcard.data).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 capitalize">
                  {key.split('_').join(' ')}:
                </h4>
                {renderContent(value)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Monetary Theory Study Tracker</h1>

      {/* Overall Progress */}
      <ProgressBar percentage={overallProgress} />

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(data).map(([topic, topicData]) => (
          <div key={topic} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {topicData.completed ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
                {topic}
              </h2>
            </div>

            <div className="space-y-4">
              {Object.entries(topicData.sections).map(
                ([section, sectionData]) => (
                  <div key={section} className="border rounded-lg p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(section)}
                    >
                      <div className="flex items-center gap-2">
                      <button
  onClick={(e) => {
    e.preventDefault(); // Prevent default button behavior
    e.stopPropagation(); // Stop event from bubbling up to parent
    toggleCompletion(topic, section);
  }}
  className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 hover:bg-gray-50"
>
  {sectionData.completed ? (
    <Check className="w-4 h-4 text-green-500" />
  ) : null}
</button>
                        <h3 className="text-lg font-semibold">{section}</h3>
                      </div>
                      {expandedSections[section] ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>

                    {expandedSections[section] && (
                      <div className="mt-4 space-y-3 pl-2">
                        {Object.entries(sectionData.concepts).map(
                          ([concept]) => (
                            <div
                            onClick={() =>
                                showFlashcard(topic, section, concept)
                              }
                              key={concept}
                              className="flex items-center justify-between bg-gray-100 pl-2 py-2 rounded-md"
                            >
                              <span>{concept}</span>
                             
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Flashcard Modal */}
      {activeFlashcard && (
        <FlashcardModal
          flashcard={activeFlashcard}
          onClose={() => setActiveFlashcard(null)}
        />
      )}
    </div>
  );
};

export default StudyTracker;
