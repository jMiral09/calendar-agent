import Image from "next/image";
import ChatWindow from "./assistant/chat-window";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center p-10">
      <ChatWindow />
    </div>
  );
}
