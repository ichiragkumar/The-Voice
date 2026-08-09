"use client";

import { motion } from "motion/react";
import { User, Bot } from "lucide-react";

type Message = {
  role: "customer" | "agent";
  text: string;
};

type Props = {
  messages: Message[];
  isProcessing: boolean;
  interimText?: string;
};

export function LiveConversation({ messages, isProcessing, interimText }: Props) {
  if (messages.length === 0 && !interimText) return null;

  return (
    <div className="space-y-3 w-full">
      {interimText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.5, x: 0 }}
          className="flex items-start gap-2"
        >
          <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <User className="h-3 w-3 text-blue-400" />
          </div>
          <p className="text-sm text-muted-foreground italic">{interimText}</p>
        </motion.div>
      )}

      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-2"
        >
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === "customer" ? "bg-blue-500/20" : "bg-emerald-500/20"
            }`}
          >
            {msg.role === "customer" ? (
              <User className="h-3 w-3 text-blue-400" />
            ) : (
              <Bot className="h-3 w-3 text-emerald-400" />
            )}
          </div>
          <div
            className={`rounded-lg px-3 py-2 text-sm max-w-md ${
              msg.role === "customer"
                ? "bg-blue-500/10 text-foreground"
                : "bg-emerald-500/10 text-foreground"
            }`}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2"
        >
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="flex gap-1 px-3 py-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
