import React, { useState, useRef, useEffect } from "react";
import "./PianoVideo.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import Button from "../shared/Button";
import DownloadButton from "../shared/DownloadButton";
import Dropdown from "react-bootstrap/Dropdown";
import VideoDropdown from "./VideoSourceDropdown";

function PianoVideo() {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<
    string | null
  >(null);

  // Keeps track if the video is available for download.
  const [videoAvailable, setVideoAvailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    async function enumerateDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      setVideoDevices(videoDevices);
      setAudioDevices(audioDevices);

      if (videoDevices.length > 0) {
        initCamera(videoDevices[0].deviceId);
      }
    }

    enumerateDevices();
  }, []);
  // Runs only once after initial render of the component (because of [])

  useEffect(() => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      console.log("Final blob size:", blob.size);
      const url = URL.createObjectURL(blob);
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = "recorded-video.webm";
      }
      setVideoAvailable(true);
    }
  }, [recordedChunks]);

  function handleDataAvailable(event: BlobEvent) {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => {
        const updated = prev.concat(event.data);
        console.log("Updated chunks:", updated);
        return updated;
      });
    }
  }

  async function initCamera(deviceId: string) {
    console.log("Init camera with: ");
    console.log(deviceId);

    const audioConstraints = selectedAudioDeviceId
      ? { deviceId: selectedAudioDeviceId }
      : true;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1080, height: 1920, deviceId: deviceId },
      audio: audioConstraints,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = async () => {
        try {
          await videoRef.current?.play();
        } catch (err) {
          console.error("Failed to play video:", err);
        }
      };
    }
  }

  function handleStop() {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url;
      downloadLinkRef.current.download = "recorded-video.webm";
    }

    setVideoAvailable(true);
  }

  function startRecording() {
    setRecordedChunks([]); // Clear the recorded chunks here
    setVideoAvailable(false);

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (MediaRecorder && MediaRecorder.isTypeSupported("video/webm")) {
        mediaRecorderRef.current = new MediaRecorder(stream);

        // Add event listener for dataavailable event
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        // Add event listener for stop event
        mediaRecorderRef.current.onstop = handleStop;

        setIsRecording(true);
        mediaRecorderRef.current.start();
      } else {
        console.error(
          "MediaRecorder not supported or video/webm not supported."
        );
      }
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  function handleButtonClick() {
    console.log("Handle Click");
  }

  return (
    <div className="main-container">
      <VideoDropdown onSelect={(deviceId) => initCamera(deviceId)} />

      <div className="video-container">
        <video ref={videoRef} width="350" height="622" autoPlay></video>
        <canvas ref={canvasRef} width="350" height="622"></canvas>
      </div>

      <div className="controls-container">
        <div className="controls-bottom">
          <div className="recording-wrapper">
            {!isRecording ? (
              <FontAwesomeIcon
                onClick={startRecording}
                icon={faVideo}
                className="record-icon"
              />
            ) : (
              <FontAwesomeIcon
                onClick={stopRecording}
                icon={faSquare}
                className="stop-recording-icon"
              />
            )}
          </div>

          <DownloadButton
            className="download-button"
            videoAvailable={videoAvailable}
            recordedChunks={recordedChunks}
          />
        </div>
      </div>
    </div>
  );
}

export default PianoVideo;
