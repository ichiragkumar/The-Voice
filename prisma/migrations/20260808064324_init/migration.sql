-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "agentPrompt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "failedCalls" INTEGER NOT NULL DEFAULT 0,
    "failureRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "transcript" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Call_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rawValue" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "sourceLayer" TEXT NOT NULL,
    "timestampStart" REAL,
    "timestampEnd" REAL,
    CONSTRAINT "Entity_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToolCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callId" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "arguments" TEXT NOT NULL,
    "response" TEXT,
    "timestamp" DATETIME,
    CONSTRAINT "ToolCall_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "callId" TEXT NOT NULL,
    "entityId" TEXT,
    "toolCallId" TEXT,
    "expectedValue" TEXT NOT NULL,
    "actualValue" TEXT NOT NULL,
    "match" BOOLEAN NOT NULL,
    "rootCause" TEXT,
    "evidence" TEXT,
    "severity" TEXT NOT NULL,
    CONSTRAINT "Comparison_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comparison_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comparison_toolCallId_fkey" FOREIGN KEY ("toolCallId") REFERENCES "ToolCall" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
