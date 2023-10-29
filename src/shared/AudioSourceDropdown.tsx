import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";

interface AudioSourceDropdownProps {
  devices: MediaDeviceInfo[];                    // The prop to pass the audio devices
  onSelect: (deviceId: string) => void;          // Callback when a device is selected
}

const AudioSourceDropdown: React.FC<AudioSourceDropdownProps> = ({ devices, onSelect }) => {
  const [selectedLabel, setSelectedLabel] = useState<string>("Select Audio Source");

  // Set the default selected label based on the first device if it exists
  useState(() => {
    if (devices.length > 0) {
      setSelectedLabel(devices[0].label || "Unnamed Device");
    }
  });

  const handleDeviceSelect = (deviceId: string, label: string) => {
    onSelect(deviceId);
    setSelectedLabel(label); // Update the selected label state when a new device is chosen
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="audio-dropdown">
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

export default AudioSourceDropdown;
