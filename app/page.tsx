"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import ChatBox from './components/ChatBox';

Amplify.configure(outputs);

export default function App() {
 return (
  <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-200">
     <div className="max-w-3xl mx-auto px-4 py-8">
      
  <div className="bg-white rounded-lg shadow-2xl p-6 ">
  
    <div className="bg-white">
      <ChatBox />
    </div>
  </div>
</div>
   </div>
 );
}