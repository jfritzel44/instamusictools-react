import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "./VideoSourceDropdown.scss";

interface VideoDropdownProps {
  onSelect: (deviceId: string) => void; // Callback when a device is selected
}

const VideoDropdown: React.FC<VideoDropdownProps> = ({ onSelect }) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>("Select Video Source");

  useEffect(() => {
    async function enumerateDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setVideoDevices(videoDevices);

      // Set the default selected label to the first device if it exists
      if (videoDevices.length > 0) {
        setSelectedLabel(videoDevices[0].label || "Unnamed Device");
      }
    }

    enumerateDevices();
  }, []);

  const handleDeviceSelect = (deviceId: string, label: string) => {
    onSelect(deviceId);
    setSelectedLabel(label); // Update the selected label state when a new device is chosen
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="video-dropdown">
        {selectedLabel}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {videoDevices.map(device => (
          <Dropdown.Item 
            key={device.deviceId} 
            onClick={() => handleDeviceSelect(device.deviceId, device.label || "Unnamed Device")}
          >
            {device.label || "Unnamed Device"}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default VideoDropdown;
