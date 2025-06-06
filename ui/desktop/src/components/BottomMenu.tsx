import React, { useState, useEffect, useRef } from 'react';
import { useModel } from './settings/models/ModelContext';
import { useRecentModels } from './settings/models/RecentModels'; // Hook for recent models
import { Sliders } from 'lucide-react';
import { ModelRadioList } from './settings/models/ModelRadioList';
import { Document, ChevronUp, ChevronDown } from './icons';
import type { View } from '../App';
import { settingsV2Enabled } from '../flags';
import { BottomMenuModeSelection } from './BottomMenuModeSelection';
import ModelsBottomBar from './settings_v2/models/bottom_bar/ModelsBottomBar';
import ToolCount from './ToolCount';

export default function BottomMenu({
  hasMessages,
  setView,
}: {
  hasMessages: boolean;
  setView: (view: View) => void;
}) {
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const { currentModel } = useModel();
  const { recentModels } = useRecentModels(); // Get recent models
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add effect to handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };

    if (isModelMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelMenuOpen]);

  // Add effect to handle Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModelMenuOpen(false);
      }
    };

    if (isModelMenuOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModelMenuOpen]);

  // Removed the envModelProvider code that was checking for environment variables

  return (
    <div className="flex justify-between items-center text-textSubtle relative bg-bgSubtle border-t border-borderSubtle text-xs pl-4 h-[40px] pb-1 align-middle">
      {/* Directory Chooser - Always visible */}
      <span
        className="cursor-pointer flex items-center [&>svg]:size-4"
        onClick={async () => {
          if (hasMessages) {
            window.electron.directoryChooser();
          } else {
            window.electron.directoryChooser(true);
          }
        }}
      >
        <Document className="mr-1" />
        Working in {window.appConfig.get('GOOSE_WORKING_DIR')}
        <ChevronUp className="ml-1" />
      </span>

      {/* Goose Mode Selector Dropdown */}
      <BottomMenuModeSelection />

      {/* Right-side section with ToolCount and Model Selector together */}
      <div className="flex items-center mr-4 space-x-1">
        {/* Tool count */}
        <ToolCount />
        {/* Model Selector Dropdown */}
        {settingsV2Enabled ? (
          <ModelsBottomBar dropdownRef={dropdownRef} setView={setView} />
        ) : (
          <div className="relative flex items-center ml-0 mr-4" ref={dropdownRef}>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            >
              <span>{(currentModel?.alias ?? currentModel?.name) || 'Select Model'}</span>
              {isModelMenuOpen ? (
                <ChevronDown className="w-4 h-4 ml-1" />
              ) : (
                <ChevronUp className="w-4 h-4 ml-1" />
              )}
            </div>

            {/* Dropdown Menu */}
            {isModelMenuOpen && (
              <div className="absolute bottom-[24px] right-0 w-[300px] bg-bgApp rounded-lg border border-borderSubtle">
                <div className="">
                  <ModelRadioList
                    className="divide-y divide-borderSubtle"
                    renderItem={({ model, isSelected, onSelect }) => (
                      <label key={model.alias ?? model.name} className="block cursor-pointer">
                        <div
                          className="flex items-center justify-between p-2 text-textStandard hover:bg-bgSubtle transition-colors"
                          onClick={onSelect}
                        >
                          <div>
                            <p className="text-sm ">{model.alias ?? model.name}</p>
                            <p className="text-xs text-textSubtle">
                              {model.subtext ?? model.provider}
                            </p>
                          </div>
                          <div className="relative">
                            <input
                              type="radio"
                              name="recentModels"
                              value={model.name}
                              checked={isSelected}
                              onChange={onSelect}
                              className="peer sr-only"
                            />
                            <div
                              className="h-4 w-4 rounded-full border border-gray-400 dark:border-gray-500
                          peer-checked:border-[6px] peer-checked:border-black dark:peer-checked:border-white
                          peer-checked:bg-white dark:peer-checked:bg-black
                          transition-all duration-200 ease-in-out"
                            ></div>
                          </div>
                        </div>
                      </label>
                    )}
                  />
                  <div
                    className="flex items-center justify-between text-textStandard p-2 cursor-pointer hover:bg-bgStandard
                  border-t border-borderSubtle mt-2"
                    onClick={() => {
                      setIsModelMenuOpen(false);
                      setView('settings');
                    }}
                  >
                    <span className="text-sm">Tools and Settings</span>
                    <Sliders className="w-5 h-5 ml-2 rotate-90" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
