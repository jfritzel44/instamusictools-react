import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";

interface VideoDropdownProps {
  onSelect: (deviceId: string) => void; // Callback when a device is selected
}

const VideoDropdown: React.FC<VideoDropdownProps> = ({ onSelect }) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function enumerateDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setVideoDevices(videoDevices);
    }

    enumerateDevices();
  }, []);

  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="video-dropdown">
        Select Video Source
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {videoDevices.map(device => (
          <Dropdown.Item key={device.deviceId} onClick={() => onSelect(device.deviceId)}>
            {device.label || "Unnamed Device"}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default VideoDropdown;
