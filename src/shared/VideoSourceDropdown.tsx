import React, { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import "./VideoSourceDropdown.scss";

interface VideoDropdownProps {
  devices: MediaDeviceInfo[];                    // The prop to pass the video devices
  onSelect: (deviceId: string) => void;          // Callback when a device is selected
}

const VideoSourceDropdown: React.FC<VideoDropdownProps> = ({ devices, onSelect }) => {
  const [selectedLabel, setSelectedLabel] = useState<string>("Select Video Source");

  // Set the default selected label based on the first device if it exists
  useEffect(() => {
    if (devices.length > 0) {
      setSelectedLabel(devices[0].label || "Unnamed Device");
    }
  }, [devices]);
  
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
        {devices.map(device => (
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

export default VideoSourceDropdown;
