# Tapp-in
​A lightweight, peer-to-peer WebRTC video streaming and chat application built to run locally on Android using Termux, Node.js, and Socket.io signaling.
Tapp In V4.2 is a mobile-first, real-time communication platform designed to bring peer-to-peer video calling and instant messaging directly to decentralized or local-host environments. Developed entirely on Android via the Termux terminal interface, the project explores the limits of running full-stack media services directly out of a mobile device environment.
​Core Features:
​Dynamic Signaling: Uses a lightweight Node.js backend powered by Express and Socket.io to manage user registration, track online status, and relay WebRTC connection states.
​True Peer-to-Peer Streaming: Leverages native browser WebRTC APIs and Google's public STUN servers to negotiate zero-latency video and audio feeds directly between clients once connected.
​Modular Storage Architecture: Designed with environment portability in mind, keeping the source control and asset backups cleanly separated onto physical external storage (external-1 SD card paths) while optimizing execution speeds through Termux internal partitions.
​Vanilla Frontend Stack: A highly optimized interface built entirely on native HTML5, CSS3 transitions, and asynchronous vanilla JavaScript—keeping resource consumption exceptionally low on mobile browsers.
