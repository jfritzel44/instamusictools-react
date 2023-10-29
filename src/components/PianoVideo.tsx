import React, { useState, useRef, useEffect } from "react";
import "./PianoVideo.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import DownloadButton from "../shared/DownloadButton";

interface PianoVideoProps {
  selectedVideoDeviceId: string;
  selectedAudioDeviceId: string;
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
}

const PianoVideo: React.FC<PianoVideoProps> = (selectedDevices) => {
  const [pianoVerticalPosition, setPianoVerticalPosition] = useState(0);

  /* We can use this to keep track of the current animation frame ID.  We can then start it, and stop it. */
  const [currAnimationFrameId, setCurrAnimationFrameId] = useState<
    number | null
  >();

  const [noteHash, setNoteHash] = useState<Record<number, boolean>>({});

  const { selectedVideoDeviceId, selectedAudioDeviceId } = selectedDevices;
  // Piano Functionality
  const whiteNotesMapper = [
    36, 38, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67,
    69, 71, 72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91, 93, 95, 96, 98, 100,
    101, 103, 105, 107, 108, 110, 112, 113, 115, 117, 119, 120, 122, 124, 125,
  ];
  const blackNotesMapper = [
    37, 39, 42, 44, 46, 49, 51, 54, 56, 58, 61, 63, 66, 68, 70, 73, 75, 78, 80,
    82, 85, 87, 90, 92, 94, 97, 99, 102, 104, 106, 109, 111, 114, 116, 118, 121,
    123, 126,
  ];

  const masterCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const whiteKeyHeight = 75;
  const videoWidth = 350;
  const videoHeight = 622;
  const totalKeys = 80; // Set the global total number of keys.
  const canvasHeight = whiteKeyHeight;

  // End Piano Functionality

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  // Keeps track if the video is available for download.
  const [videoAvailable, setVideoAvailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  let animationFrameId: number | null = null;

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

      if (videoDevices.length > 0 && audioDevices.length > 0) {
        initCamera(videoDevices[0].deviceId, audioDevices[0].deviceId);
      }
    }

    enumerateDevices();
  }, []);

  // Runs only once after initial render of the component (because of [])
  useEffect(() => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = "recorded-video.webm";
      }
      setVideoAvailable(true);
    }
  }, [recordedChunks]);
  // Runs when recordedChunks changes.

  useEffect(() => {
    initCamera(selectedVideoDeviceId, selectedAudioDeviceId);
  }, [selectedVideoDeviceId, selectedAudioDeviceId]);

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("WebMIDI is not supported in this browser.");
    }

    function onMIDISuccess(midiAccess: WebMidi.MIDIAccess) {
      const inputs = midiAccess.inputs.values();
      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        input.value.onmidimessage = onMIDIMessage;
      }
    }

    function onMIDIFailure() {
      console.warn("Could not access your MIDI devices.");
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const handlePlay = () => {
        drawPiano();
      };

      videoRef.current.addEventListener("play", handlePlay);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("play", handlePlay);
        }
      };
    }
  }, []);

  useEffect(() => {
    drawPiano();
  }, [noteHash]);

  function handleDataAvailable(event: BlobEvent) {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => {
        const updated = prev.concat(event.data);
        console.log("Updated chunks:", updated);
        return updated;
      });
    }
  }

  function onMIDIMessage(message: WebMidi.MIDIMessageEvent) {
    const [status, note, velocity] = Array.from(message.data);

    const isNoteOnMessage = status === 144 && velocity > 0;
    const isNoteOffMessage =
      status === 128 || (status === 144 && velocity === 0);

    // If neither a note-on nor a note-off message, return early
    if (!isNoteOnMessage && !isNoteOffMessage) {
      return;
    }

    if (isNoteOnMessage) {
      setNoteHash((prev) => ({
        ...prev,
        [note]: true,
      }));
    } else if (isNoteOffMessage) {
      setNoteHash((prev) => ({
        ...prev,
        [note]: false,
      }));
    }
  }

  const drawPiano = () => {
    if (canvasRef.current && videoRef.current) {
      const yOffset = pianoVerticalPosition;

      const ctx = canvasRef.current.getContext("2d")!;

      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      // Piano dimensions
      const whiteKeyWidth = 540 / ((totalKeys * 7) / 12); // Divide by number of white keys
      const blackKeyWidth = whiteKeyWidth / 2;
      const blackKeyHeight = whiteKeyHeight * 0.65; // Typically, black keys are three-fourths the height of white keys

      // Draw white keys
      for (let i = 0; i < totalKeys; i++) {
        const x = i * whiteKeyWidth;
        const midiNote = whiteNotesMapper[i];

        // Check if note is pressed using the correct MIDI note number
        if (noteHash[midiNote]) {
          ctx.fillStyle = "green"; // or another color to indicate a pressed key
        } else {
          ctx.fillStyle = "white";
        }

        ctx.fillRect(x, yOffset, whiteKeyWidth, whiteKeyHeight);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, yOffset, whiteKeyWidth, whiteKeyHeight);
      }

      // Black keys
      const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0];
      let blackNoteCounter = 0;

      for (let i = 0; i < 52; i++) {
        // There are 52 black keys in total over the 5 octaves
        const octave = Math.floor(i / 7);
        const noteInOctave = i % 7;

        if (blackKeyPattern[noteInOctave] === 0) {
          continue; // Skip this loop iteration if no black key for this position
        }

        const whiteKeyIndex = octave * 7 + noteInOctave + 1; // Corresponding white key to the left of the black key

        const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;

        // Get the MIDI note number for the current black key
        const midiNote = blackNotesMapper[blackNoteCounter];

        if (noteHash[midiNote]) {
          ctx.fillStyle = "green"; // or another color to indicate a pressed key
        } else {
          ctx.fillStyle = "black";
        }

        ctx.fillRect(x, yOffset, blackKeyWidth, blackKeyHeight);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, yOffset, blackKeyWidth, blackKeyHeight); // Optional: for outline

        blackNoteCounter++;
      }
    }
  };

  async function initCamera(videoDeviceId: string, audioDeviceId: string) {
    if (!videoDeviceId || !audioDeviceId) return;

    if (!videoDeviceId) videoDeviceId = videoDevices[0].deviceId;
    if (!audioDeviceId) audioDeviceId = audioDevices[0].deviceId;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1080, height: 1920, deviceId: videoDeviceId },
      audio: { deviceId: audioDeviceId },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = async () => {
        try {
          await videoRef.current?.play();
          drawPiano();
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

  const drawMasterCanvas = () => {
    if (masterCanvasRef.current && videoRef.current && canvasRef.current) {
      const ctx = masterCanvasRef.current.getContext("2d")!;
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      ctx.drawImage(canvasRef.current, 0, 0, videoWidth, canvasHeight);
    }
  };

  function drawLoop() {
    drawMasterCanvas();

    // Request the next frame, will loop indefinitely until DL.
    animationFrameId = requestAnimationFrame(drawLoop);

    // So we can cancel the animation by id in stop download, pretty much.
    setCurrAnimationFrameId(animationFrameId);
  }

  function startRecording() {
    drawLoop();

    setRecordedChunks([]); // Clear the recorded chunks here
    setVideoAvailable(false);

    if (masterCanvasRef.current) {
      const canvasStream = masterCanvasRef.current.captureStream();

      // Retrieve the user media stream from the videoRef's srcObject
      const userMediaStream = videoRef.current?.srcObject as MediaStream;

      // Check and add the audio track to the canvas stream
      if (userMediaStream && userMediaStream.getAudioTracks().length > 0) {
        const audioTrack = userMediaStream.getAudioTracks()[0];
        canvasStream.addTrack(audioTrack);
      }

      if (MediaRecorder && MediaRecorder.isTypeSupported("video/webm")) {
        mediaRecorderRef.current = new MediaRecorder(canvasStream);

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

      cancelAnimationFrame(currAnimationFrameId ? currAnimationFrameId : 0);
      setCurrAnimationFrameId(null);
    }
  }

  return (
    <div className="main-container">
      <div className="video-container">
        {/* This is just the piano */}
        <canvas
          className="piano-canvas"
          ref={canvasRef}
          width={videoWidth}
          height={canvasHeight}
        ></canvas>

        {/* Canvas for main video */}
        <video
          className="main-video"
          ref={videoRef}
          width={videoWidth}
          height={videoHeight}
          autoPlay
          muted
        ></video>

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

        {/* Canvas that will have video, and piano overlay for output */}
        <canvas
          ref={masterCanvasRef}
          width={videoWidth}
          height={videoHeight}
          style={{ display: "none" }} // Hide it from the user
        ></canvas>
      </div>
    </div>
  );
};

export default PianoVideo;
