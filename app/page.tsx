"use client";
import Image from "next/image";
import { useState } from "react";
import { PaperPlaneTilt, SpinnerGap } from "phosphor-react";
import daxPic from "../public/dax-logo.png";
import daxBotPic from "../public/dax-logo-icon.png";
import {api} from "../lib/axios";

enum Creator {
  Me = 0,
  Bot = 1
}

interface MessageProps {
  key: number;
  text: string;
  from: Creator;
}

interface InputProps {
  onSend: (input: string) => void;
  disabled: boolean;
}

const ChatMessage = ({text, from, key}: MessageProps) => {
  return (
    <>
      {
        from == Creator.Me && (
          <div key={key} className="bg-zinc-100 p-4 rounded-lg flex mt-4 items-center whitespace-pre-wrap">
            <p className="text-gray-700">{text}</p>
          </div>
        )
      }
      {
         from == Creator.Bot && (
          <div key={key} className="bg-dax-400 p-4 rounded-lg flex mt-4 items-center whitespace-pre-wrap">
            <Image src={daxBotPic} alt="User" width={40}/>
            <p className="text-gray-700 ml-3">{text}</p>
          </div>
        )
      }
    </>
  )
}

const ChatInput = ({onSend, disabled}: InputProps) => {
  const [input, setInput] = useState('');

  const sendInput = () => {
    onSend(input);
    setInput('');
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 13){
      e.preventDefault();
      sendInput();
    }
  }

  return (
    <div className="bg-white border-2 p-2 rounded-lg flex justify-center">
      <input 
        value={input}
        onChange={(ev: any) => setInput(ev.target.value)}
        className="w-full py-2 text-gray-800 rounded-lg focus:outline-none"
        type="text"
        placeholder="Ask me anything"
        disabled={disabled}
        onKeyDown={(ev: any) => handleKeyDown(ev)}
      />
      {
        disabled && (
          <button
            disabled={true}
            className="p-2 rounded-md text-gray-500 bottom-2 right-1 animate-spin"
          >
            <SpinnerGap size={20} />
          </button>
        )
      }
      {!disabled && (
        <button 
          onClick={() => sendInput()}
          className="p-2 rounded-md text-gray-500 bottom-2 right-1"
          >
          <PaperPlaneTilt size={20} />
        </button>
      )}

    </div>
  )
}

export default function Home(){
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState(false);

  const callApi = async (input: string) => {
    setLoading(true);

    const newMessage: MessageProps = {
      key: new Date().getTime(),
      from: Creator.Me,
      text: input
    };

    setMessages(prevState => [...prevState, newMessage]);

    try {
      const response = await api.post("/webhooks/rest/webhook", {
        message: input
      }).then(response => response.data);
      if(response[0].text){
        const responseMessage: MessageProps = {
          key: new Date().getTime(),
          from: Creator.Bot,
          text: response[0].text
        }
        setMessages(prevState => [...prevState, responseMessage]);
      }

    }catch (err) {
      console.log(err);
    }finally{
      setLoading(false);
    }
    
  }

  return (
    <main className="relative max-w-2xl mx-auto">
      <div className="py-20">
        <Image
          src={daxPic}
          alt="dax"
          className=""
          />
      </div>
      <div className="sticky top-0 w-full">
        <ChatInput onSend={(input) => callApi(input)} disabled={loading} />
      </div>
        {
          messages.sort((a,b) => b.key - a.key).map((msg: MessageProps) => 
            <ChatMessage key={msg.key} text={msg.text} from={msg.from}/>
          )
        }
    </main>
  )

}