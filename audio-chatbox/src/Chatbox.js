import React, { useState, useRef } from "react";
import axios from "axios";
import "./Chatbox.css";

const Chatbox = () => {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.addEventListener("dataavailable", (event) => {
          chunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const recordedAudio = new Blob(chunks, { type: "audio/webm" });
          setAudioFile(recordedAudio);
          mediaStreamRef.current.getAudioTracks()[0].stop(); // Release the microphone
        });

        // Update the mediaRecorderRef and mediaStreamRef
        mediaRecorderRef.current = mediaRecorder;
        mediaStreamRef.current = stream;

        // Start recording
        mediaRecorder.start();

        // Stop recording after a certain duration (e.g., 10 seconds)
        setTimeout(() => {
          stopRecording();
        }, 10000);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });

    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
  };

  const handleSendMessage = () => {
    if (audioFile) {
      const formData = new FormData();
      formData.append("audio", audioFile);

      axios
        .post("http://localhost:5000/api/messages", formData)
        .then((response) => {
          console.log("Audio message sent successfully:", response);
          // Add your desired logic after successfully sending the audio message
        })
        .catch((error) => {
          console.error("Error sending audio message:", error);
          // Add error handling logic here if desired
        });

      setAudioFile(null); // Clear the audio file after sending the message
    }
  };

  const downloadAudio = () => {
    const url = URL.createObjectURL(audioFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recorded_audio.webm";
    link.click();
  };

  return (
    <div className="Chatbox">
      {" "}
      <h2>Chat Box</h2>
      {/* Apply the "Chatbox" CSS class to the container */}
      {/* Your existing JSX code for the chatbox component */}
      <button
        className="Button"
        onClick={recording ? null : startRecording}
        disabled={recording}
      >
        {recording ? "Recording..." : "Start Recording"}
      </button>
      <button className="Button" onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <button
        className="Button"
        onClick={handleSendMessage}
        disabled={!audioFile}
      >
        Send Message
      </button>
      {audioFile && (
        <button className="Button" onClick={downloadAudio}>
          Download Audio
        </button>
      )}
    </div>
  );
};

export default Chatbox;
