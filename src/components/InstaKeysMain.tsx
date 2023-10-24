// InstaKeyMain.tsx

import React, { useState } from "react";
import PianoVideo from "./PianoVideo";
import AvSettings from "./AvSettings"; // Import the new AvSettings component
import "./InstaKeysMain.scss";

const InstaKeyMain = () => {
  // Selected Device ID for Webcam
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string | null>(null);

  // Selected Device ID for Microphone
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string | null>(null);

  return (
    <div className="instakeys-container">
      <PianoVideo selectedDeviceId={selectedVideoDeviceId ? selectedVideoDeviceId : ""} />

      <div className="all-settings">
        <AvSettings onVideoSelect={setSelectedVideoDeviceId} onAudioSelect={setSelectedAudioDeviceId} />

      </div>
    </div>
  );
};

export default InstaKeyMain;
