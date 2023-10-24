// AvSettings.tsx

import React from "react";
import VideoDropdown from "./VideoSourceDropdown";
import AudioSourceDropdown from "./AudioSourceDropdown";
import "./AvSettings.scss"; // Import the style for this component

interface AvSettingsProps {
  onVideoSelect: (deviceId: string) => void;
  onAudioSelect: (deviceId: string) => void;
}

const AvSettings: React.FC<AvSettingsProps> = ({ onVideoSelect, onAudioSelect }) => {
  return (
    <div className="av-settings">
      <p className="settings-title">Audio / Video Settings</p>

      <div>
        <div className="settings-row">
            <label className="settings-label">Video <br /> Settings:</label>
            <VideoDropdown onSelect={onVideoSelect} />
        </div>
        <div className="settings-row">
            <label className="settings-label">Audio <br /> Settings:</label>
            <AudioSourceDropdown onSelect={onAudioSelect} />
        </div>
      </div>
    </div>
  );
};

export default AvSettings;
