import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import "./DownloadButton.scss";

interface DownloadButtonProps {
  videoAvailable: boolean;
  recordedChunks: BlobPart[];
  className?: string; // Add this
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ videoAvailable, recordedChunks, className }) => {
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!videoAvailable) {
      e.preventDefault();
    }
  };

  const downloadHref = videoAvailable
    ? URL.createObjectURL(new Blob(recordedChunks, { type: "video/webm" }))
    : "javascript:void(0);";

  return (
    <a
      ref={downloadLinkRef}
      href={downloadHref}
      download="recorded-video.webm"
      className={`${!videoAvailable ? "disabled-link" : ""} ${className}`} // Use the className prop here
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faDownload} />
      Download Video
    </a>
  );
};

export default DownloadButton;
