import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";

interface AudioSourceDropdownProps {
  onSelect: (deviceId: string) => void; // Callback when a device is selected
}

const AudioSourceDropdown: React.FC<AudioSourceDropdownProps> = ({ onSelect }) => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>("Select Audio Source");

  useEffect(() => {
    async function enumerateDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevicesFiltered = devices.filter(device => device.kind === "audioinput");
      setAudioDevices(audioDevicesFiltered);

      // Set the default selected label to the first device if it exists
      if (audioDevicesFiltered.length > 0) {
        setSelectedLabel(audioDevicesFiltered[0].label || "Unnamed Device");
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
      <Dropdown.Toggle variant="secondary" id="audio-dropdown">
        {selectedLabel}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {audioDevices.map(device => (
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
