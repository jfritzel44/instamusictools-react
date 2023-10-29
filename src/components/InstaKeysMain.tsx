import { useEffect, useState } from "react";
import AudioSourceDropdown from "../shared/AudioSourceDropdown";
import PianoVideo from "./PianoVideo";
import VideoSourceDropdown from "../shared/VideoSourceDropdown";
import "./InstaKeysMain.scss";

const InstaKeyMain = () => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<
    string | null
  >(null);

  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function enumerateDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDeviceList = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioDeviceList = devices.filter(
        (device) => device.kind === "audioinput"
      );

      setVideoDevices(videoDeviceList);
      setAudioDevices(audioDeviceList);

      setSelectedAudioDeviceId(audioDeviceList[0].deviceId);
      setSelectedVideoDeviceId(videoDeviceList[0].deviceId);
    }

    enumerateDevices();
  }, []);

  return (
    <div className="instakeys-container">
      {audioDevices.length > 0 && videoDevices.length > 0 && (
        <>
          <div className="piano-video">
            <PianoVideo
              videoDevices={videoDevices}
              audioDevices={audioDevices}
              selectedVideoDeviceId={selectedVideoDeviceId ?? ""}
              selectedAudioDeviceId={selectedAudioDeviceId ?? ""}
            />
          </div>

          <div className="av-settings">
            <p>Audio / Video Settings</p>
            <div>
              <VideoSourceDropdown
                devices={videoDevices}
                onSelect={setSelectedVideoDeviceId}
              />
              <AudioSourceDropdown
                devices={audioDevices}
                onSelect={setSelectedAudioDeviceId}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstaKeyMain;
