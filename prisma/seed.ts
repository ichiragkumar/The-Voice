import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.comparison.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.toolCall.deleteMany();
  await prisma.call.deleteMany();
  await prisma.audit.deleteMany();

  // ── Audit 1: Dr. Sharma Clinic ──
  const audit1 = await prisma.audit.create({
    data: {
      name: "Dr. Sharma Clinic - August Audit",
      agentPrompt:
        "You are a medical appointment assistant for Dr. Sharma's clinic. Help patients book, reschedule, and cancel appointments. Available doctors: Dr. Sharma, Dr. Patel, Dr. Gupta. Working hours: 9 AM - 6 PM, Monday to Saturday.",
      status: "completed",
      totalCalls: 10,
      failedCalls: 3,
      failureRate: 0.3,
    },
  });

  // ── Call 1: FAIL — reasoning_error (date + time) ──
  const call1 = await prisma.call.create({
    data: {
      auditId: audit1.id,
      transcript:
        "Agent: Namaste, Dr. Sharma clinic mein aapka swagat hai. Kaise madad kar sakta hoon?\nCustomer: Haan, mera appointment kal ke liye tha Dr. Sharma ke saath. Lekin kal nahi, uske agle din shaam ko saade chaar baje kar do.\nAgent: Theek hai, main aapka appointment reschedule kar deta hoon kal shaam 4 baje ke liye. Confirmed.\nCustomer: Haan theek hai, dhanyavaad.",
      language: "hinglish",
      status: "failed",
      summary:
        "Patient rescheduling to day-after-tomorrow at 4:30 PM — agent booked tomorrow at 4:00 PM",
    },
  });

  const e1_1 = await prisma.entity.create({
    data: {
      callId: call1.id,
      type: "name",
      rawValue: "Dr. Sharma",
      normalizedValue: "Dr. Sharma",
      confidence: 0.95,
      sourceLayer: "asr_transcript",
      timestampStart: 8.2,
      timestampEnd: 9.1,
    },
  });

  const e1_2 = await prisma.entity.create({
    data: {
      callId: call1.id,
      type: "date",
      rawValue: "uske agle din",
      normalizedValue: "2026-08-12",
      confidence: 0.7,
      sourceLayer: "asr_transcript",
      timestampStart: 14.5,
      timestampEnd: 16.0,
    },
  });

  const e1_3 = await prisma.entity.create({
    data: {
      callId: call1.id,
      type: "time",
      rawValue: "saade chaar baje",
      normalizedValue: "16:30",
      confidence: 0.85,
      sourceLayer: "asr_transcript",
      timestampStart: 17.2,
      timestampEnd: 18.5,
    },
  });

  const e1_4 = await prisma.entity.create({
    data: {
      callId: call1.id,
      type: "action",
      rawValue: "kar do",
      normalizedValue: "reschedule",
      confidence: 0.9,
      sourceLayer: "agent_interpretation",
      timestampStart: 18.8,
      timestampEnd: 19.3,
    },
  });

  const tc1 = await prisma.toolCall.create({
    data: {
      callId: call1.id,
      functionName: "reschedule_appointment",
      arguments: JSON.stringify({
        patient_id: "P001",
        doctor: "Dr. Sharma",
        date: "2026-08-11",
        time: "16:00",
      }),
      response: JSON.stringify({
        success: true,
        appointment_id: "APT-1234",
      }),
    },
  });

  await prisma.comparison.createMany({
    data: [
      {
        callId: call1.id,
        entityId: e1_2.id,
        toolCallId: tc1.id,
        expectedValue: "2026-08-12",
        actualValue: "2026-08-11",
        match: false,
        rootCause: "reasoning_error",
        evidence:
          "Agent resolved 'uske agle din' (the day after tomorrow) as tomorrow instead of day-after-tomorrow. The reference 'kal' means tomorrow (Aug 11), so 'uske agle din' should be Aug 12.",
        severity: "critical",
      },
      {
        callId: call1.id,
        entityId: e1_3.id,
        toolCallId: tc1.id,
        expectedValue: "16:30",
        actualValue: "16:00",
        match: false,
        rootCause: "reasoning_error",
        evidence:
          "Agent failed to interpret 'saade chaar baje' correctly. 'Saade' (साढ़े) means half-past, so 'saade chaar' = 4:30, not 4:00.",
        severity: "critical",
      },
      {
        callId: call1.id,
        entityId: e1_1.id,
        toolCallId: tc1.id,
        expectedValue: "Dr. Sharma",
        actualValue: "Dr. Sharma",
        match: true,
        severity: "info",
      },
      {
        callId: call1.id,
        entityId: e1_4.id,
        toolCallId: tc1.id,
        expectedValue: "reschedule",
        actualValue: "reschedule",
        match: true,
        severity: "info",
      },
    ],
  });

  // ── Call 2: FAIL — asr_error (name confusion) ──
  const call2 = await prisma.call.create({
    data: {
      auditId: audit1.id,
      transcript:
        "Agent: Namaste, Dr. Sharma clinic. Kaise madad karun?\nCustomer: Sharma ji ka appointment cancel kar do. Aur Verma ji ka next week Monday rakh do, subah das baje.\nAgent: Theek hai, Verma ji ka appointment cancel kar diya hai.\nCustomer: Nahi nahi, Sharma ji ka cancel karna tha! Verma ji ka book karna tha!\nAgent: Oh, maaf kijiye. Abhi correct karta hoon.",
      language: "hinglish",
      status: "failed",
      summary:
        "Cancel Sharma, book Verma — agent cancelled Verma instead (name swap)",
    },
  });

  const e2_1 = await prisma.entity.create({
    data: {
      callId: call2.id,
      type: "name",
      rawValue: "Sharma ji",
      normalizedValue: "Sharma",
      confidence: 0.9,
      sourceLayer: "asr_transcript",
      timestampStart: 5.3,
      timestampEnd: 6.1,
    },
  });

  const e2_2 = await prisma.entity.create({
    data: {
      callId: call2.id,
      type: "name",
      rawValue: "Verma ji",
      normalizedValue: "Verma",
      confidence: 0.6,
      sourceLayer: "asr_transcript",
      timestampStart: 8.7,
      timestampEnd: 9.4,
    },
  });

  const e2_3 = await prisma.entity.create({
    data: {
      callId: call2.id,
      type: "action",
      rawValue: "cancel kar do",
      normalizedValue: "cancel",
      confidence: 0.95,
      sourceLayer: "agent_interpretation",
      timestampStart: 6.2,
      timestampEnd: 7.5,
    },
  });

  const e2_4 = await prisma.entity.create({
    data: {
      callId: call2.id,
      type: "action",
      rawValue: "rakh do",
      normalizedValue: "book",
      confidence: 0.9,
      sourceLayer: "agent_interpretation",
      timestampStart: 10.1,
      timestampEnd: 10.8,
    },
  });

  const e2_5 = await prisma.entity.create({
    data: {
      callId: call2.id,
      type: "date",
      rawValue: "next week Monday",
      normalizedValue: "2026-08-17",
      confidence: 0.85,
      sourceLayer: "asr_transcript",
      timestampStart: 9.5,
      timestampEnd: 10.0,
    },
  });

  const e2_6 = await prisma.entity.create({
    data: {
      callId: call2.id,
      type: "time",
      rawValue: "subah das baje",
      normalizedValue: "10:00",
      confidence: 0.9,
      sourceLayer: "asr_transcript",
      timestampStart: 10.9,
      timestampEnd: 11.8,
    },
  });

  const tc2 = await prisma.toolCall.create({
    data: {
      callId: call2.id,
      functionName: "cancel_appointment",
      arguments: JSON.stringify({
        patient_name: "Verma",
        reason: "patient_request",
      }),
      response: JSON.stringify({ success: true }),
    },
  });

  await prisma.comparison.createMany({
    data: [
      {
        callId: call2.id,
        entityId: e2_1.id,
        toolCallId: tc2.id,
        expectedValue: "Sharma",
        actualValue: "Verma",
        match: false,
        rootCause: "asr_error",
        evidence:
          "ASR confused the names in a multi-instruction utterance. Customer said to cancel Sharma's appointment, but the system cancelled Verma's instead. The names 'Sharma' and 'Verma' are phonetically similar in Hindi.",
        severity: "critical",
      },
      {
        callId: call2.id,
        entityId: e2_3.id,
        toolCallId: tc2.id,
        expectedValue: "cancel",
        actualValue: "cancel",
        match: true,
        severity: "info",
      },
    ],
  });

  // ── Call 3: FAIL — false_confirmation ──
  const call3 = await prisma.call.create({
    data: {
      auditId: audit1.id,
      transcript:
        "Agent: Dr. Sharma clinic, good evening. How can I help?\nCustomer: Mera appointment confirm kar dijiye Wednesday ko shaam 4:30 baje. Dr. Patel ke saath.\nAgent: Sure, aapka appointment confirmed hai Wednesday 4:30 PM, Dr. Patel ke saath.\nCustomer: Thank you.",
      language: "hinglish",
      status: "failed",
      summary:
        "Confirmed Wednesday 4:30 PM verbally but booked Tuesday 4:00 PM in system",
    },
  });

  const e3_1 = await prisma.entity.create({
    data: {
      callId: call3.id,
      type: "date",
      rawValue: "Wednesday",
      normalizedValue: "2026-08-12",
      confidence: 0.9,
      sourceLayer: "asr_transcript",
      timestampStart: 7.0,
      timestampEnd: 7.8,
    },
  });

  const e3_2 = await prisma.entity.create({
    data: {
      callId: call3.id,
      type: "time",
      rawValue: "shaam 4:30 baje",
      normalizedValue: "16:30",
      confidence: 0.95,
      sourceLayer: "asr_transcript",
      timestampStart: 8.0,
      timestampEnd: 9.2,
    },
  });

  const e3_3 = await prisma.entity.create({
    data: {
      callId: call3.id,
      type: "name",
      rawValue: "Dr. Patel",
      normalizedValue: "Dr. Patel",
      confidence: 0.95,
      sourceLayer: "asr_transcript",
      timestampStart: 9.5,
      timestampEnd: 10.3,
    },
  });

  const tc3 = await prisma.toolCall.create({
    data: {
      callId: call3.id,
      functionName: "confirm_appointment",
      arguments: JSON.stringify({
        patient_id: "P003",
        doctor: "Dr. Patel",
        date: "2026-08-11",
        time: "16:00",
      }),
      response: JSON.stringify({
        success: true,
        appointment_id: "APT-5678",
      }),
    },
  });

  await prisma.comparison.createMany({
    data: [
      {
        callId: call3.id,
        entityId: e3_1.id,
        toolCallId: tc3.id,
        expectedValue: "2026-08-12",
        actualValue: "2026-08-11",
        match: false,
        rootCause: "false_confirmation",
        evidence:
          "Agent confirmed 'Wednesday 4:30 PM' verbally but the tool call sent Tuesday (Aug 11) at 4:00 PM. The spoken confirmation did not match what was actually booked in the backend.",
        severity: "critical",
      },
      {
        callId: call3.id,
        entityId: e3_2.id,
        toolCallId: tc3.id,
        expectedValue: "16:30",
        actualValue: "16:00",
        match: false,
        rootCause: "false_confirmation",
        evidence:
          "Agent verbally confirmed 4:30 PM but booked 4:00 PM in the system. The customer was told the correct time but the backend received a different value.",
        severity: "critical",
      },
      {
        callId: call3.id,
        entityId: e3_3.id,
        toolCallId: tc3.id,
        expectedValue: "Dr. Patel",
        actualValue: "Dr. Patel",
        match: true,
        severity: "info",
      },
    ],
  });

  // ── Calls 4–10: PASS ──
  const passingCalls = [
    {
      transcript:
        "Agent: Namaste, Dr. Sharma clinic.\nCustomer: Hello, I'd like to book an appointment with Dr. Gupta for tomorrow morning at 10 AM.\nAgent: Sure, booked for tomorrow 10 AM with Dr. Gupta.\nCustomer: Perfect, thank you.",
      language: "english",
      summary: "Book appointment with Dr. Gupta tomorrow 10 AM",
      entities: [
        { type: "name", rawValue: "Dr. Gupta", normalizedValue: "Dr. Gupta", confidence: 0.98, sourceLayer: "asr_transcript", timestampStart: 5.0, timestampEnd: 5.8 },
        { type: "date", rawValue: "tomorrow", normalizedValue: "2026-08-09", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 6.0, timestampEnd: 6.5 },
        { type: "time", rawValue: "10 AM", normalizedValue: "10:00", confidence: 0.98, sourceLayer: "asr_transcript", timestampStart: 7.0, timestampEnd: 7.5 },
      ],
      toolCall: {
        functionName: "book_appointment",
        arguments: { patient_id: "P004", doctor: "Dr. Gupta", date: "2026-08-09", time: "10:00" },
        response: { success: true, appointment_id: "APT-2001" },
      },
    },
    {
      transcript:
        "Agent: Dr. Sharma clinic, namaste.\nCustomer: Priya Mehta bol rahi hoon. Mera kal ka appointment cancel kar dijiye please.\nAgent: Priya ji, aapka kal ka appointment cancel kar diya gaya hai.\nCustomer: Shukriya.",
      language: "hinglish",
      summary: "Priya Mehta cancelling tomorrow's appointment",
      entities: [
        { type: "name", rawValue: "Priya Mehta", normalizedValue: "Priya Mehta", confidence: 0.92, sourceLayer: "asr_transcript", timestampStart: 4.5, timestampEnd: 5.5 },
        { type: "date", rawValue: "kal", normalizedValue: "2026-08-09", confidence: 0.9, sourceLayer: "asr_transcript", timestampStart: 6.0, timestampEnd: 6.3 },
        { type: "action", rawValue: "cancel kar dijiye", normalizedValue: "cancel", confidence: 0.95, sourceLayer: "agent_interpretation", timestampStart: 6.5, timestampEnd: 7.5 },
      ],
      toolCall: {
        functionName: "cancel_appointment",
        arguments: { patient_name: "Priya Mehta", date: "2026-08-09" },
        response: { success: true },
      },
    },
    {
      transcript:
        "Agent: Good morning, Dr. Sharma's clinic.\nCustomer: Hi, this is Rajesh Kumar. Can I reschedule my Thursday appointment to Friday at 2 PM?\nAgent: Done, Rajesh ji. Your appointment is now Friday at 2 PM.\nCustomer: Thanks a lot.",
      language: "english",
      summary: "Rajesh Kumar rescheduling Thursday to Friday 2 PM",
      entities: [
        { type: "name", rawValue: "Rajesh Kumar", normalizedValue: "Rajesh Kumar", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 4.0, timestampEnd: 5.0 },
        { type: "date", rawValue: "Friday", normalizedValue: "2026-08-14", confidence: 0.9, sourceLayer: "asr_transcript", timestampStart: 7.0, timestampEnd: 7.5 },
        { type: "time", rawValue: "2 PM", normalizedValue: "14:00", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 7.8, timestampEnd: 8.2 },
      ],
      toolCall: {
        functionName: "reschedule_appointment",
        arguments: { patient_name: "Rajesh Kumar", date: "2026-08-14", time: "14:00" },
        response: { success: true, appointment_id: "APT-2003" },
      },
    },
    {
      transcript:
        "Agent: Namaste, clinic mein aapka swagat hai.\nCustomer: Anita Desai hoon. Mujhe Dr. Sharma se milna hai parson subah gyaarah baje.\nAgent: Anita ji, parson subah 11 baje Dr. Sharma ke saath appointment book kar diya.\nCustomer: Bahut accha, dhanyavaad.",
      language: "hindi",
      summary: "Anita Desai booking with Dr. Sharma day-after-tomorrow 11 AM",
      entities: [
        { type: "name", rawValue: "Anita Desai", normalizedValue: "Anita Desai", confidence: 0.93, sourceLayer: "asr_transcript", timestampStart: 4.0, timestampEnd: 5.0 },
        { type: "name", rawValue: "Dr. Sharma", normalizedValue: "Dr. Sharma", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 6.0, timestampEnd: 6.8 },
        { type: "date", rawValue: "parson", normalizedValue: "2026-08-10", confidence: 0.88, sourceLayer: "asr_transcript", timestampStart: 7.0, timestampEnd: 7.4 },
        { type: "time", rawValue: "subah gyaarah baje", normalizedValue: "11:00", confidence: 0.9, sourceLayer: "asr_transcript", timestampStart: 7.5, timestampEnd: 8.5 },
      ],
      toolCall: {
        functionName: "book_appointment",
        arguments: { patient_name: "Anita Desai", doctor: "Dr. Sharma", date: "2026-08-10", time: "11:00" },
        response: { success: true, appointment_id: "APT-2004" },
      },
    },
    {
      transcript:
        "Agent: Dr. Sharma clinic, kaise madad karun?\nCustomer: Mera naam Suresh Reddy hai. Aaj shaam paanch baje ka appointment hai Dr. Patel ke saath. Bas confirm karna tha.\nAgent: Suresh ji, haan aapka aaj shaam 5 baje Dr. Patel ke saath confirmed hai.\nCustomer: Accha, theek hai.",
      language: "hinglish",
      summary: "Suresh Reddy confirming today's 5 PM appointment with Dr. Patel",
      entities: [
        { type: "name", rawValue: "Suresh Reddy", normalizedValue: "Suresh Reddy", confidence: 0.91, sourceLayer: "asr_transcript", timestampStart: 4.5, timestampEnd: 5.5 },
        { type: "date", rawValue: "aaj", normalizedValue: "2026-08-08", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 6.0, timestampEnd: 6.3 },
        { type: "time", rawValue: "shaam paanch baje", normalizedValue: "17:00", confidence: 0.92, sourceLayer: "asr_transcript", timestampStart: 6.5, timestampEnd: 7.5 },
        { type: "name", rawValue: "Dr. Patel", normalizedValue: "Dr. Patel", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 8.0, timestampEnd: 8.7 },
      ],
      toolCall: {
        functionName: "confirm_appointment",
        arguments: { patient_name: "Suresh Reddy", doctor: "Dr. Patel", date: "2026-08-08", time: "17:00" },
        response: { success: true, appointment_id: "APT-2005" },
      },
    },
    {
      transcript:
        "Agent: Namaste, Dr. Sharma clinic.\nCustomer: Namaste, mujhe Monday ko Dr. Gupta se milna hai, dopahar ek baje. Naam hai Kavita Joshi.\nAgent: Kavita ji, Monday dopahar 1 baje Dr. Gupta ke saath book kar diya.\nCustomer: Dhanyavaad.",
      language: "hindi",
      summary: "Kavita Joshi booking Monday 1 PM with Dr. Gupta",
      entities: [
        { type: "name", rawValue: "Kavita Joshi", normalizedValue: "Kavita Joshi", confidence: 0.9, sourceLayer: "asr_transcript", timestampStart: 8.0, timestampEnd: 9.0 },
        { type: "name", rawValue: "Dr. Gupta", normalizedValue: "Dr. Gupta", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 5.5, timestampEnd: 6.3 },
        { type: "date", rawValue: "Monday", normalizedValue: "2026-08-10", confidence: 0.92, sourceLayer: "asr_transcript", timestampStart: 4.5, timestampEnd: 5.0 },
        { type: "time", rawValue: "dopahar ek baje", normalizedValue: "13:00", confidence: 0.9, sourceLayer: "asr_transcript", timestampStart: 6.5, timestampEnd: 7.5 },
      ],
      toolCall: {
        functionName: "book_appointment",
        arguments: { patient_name: "Kavita Joshi", doctor: "Dr. Gupta", date: "2026-08-10", time: "13:00" },
        response: { success: true, appointment_id: "APT-2006" },
      },
    },
    {
      transcript:
        "Agent: Good afternoon, Dr. Sharma's clinic.\nCustomer: Hi, I'm Amit Trivedi. I need to cancel my appointment for August 15th with Dr. Sharma.\nAgent: Amit ji, your appointment on August 15th with Dr. Sharma has been cancelled.\nCustomer: Thank you very much.",
      language: "english",
      summary: "Amit Trivedi cancelling August 15th appointment with Dr. Sharma",
      entities: [
        { type: "name", rawValue: "Amit Trivedi", normalizedValue: "Amit Trivedi", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 4.0, timestampEnd: 5.0 },
        { type: "date", rawValue: "August 15th", normalizedValue: "2026-08-15", confidence: 0.98, sourceLayer: "asr_transcript", timestampStart: 7.0, timestampEnd: 7.8 },
        { type: "name", rawValue: "Dr. Sharma", normalizedValue: "Dr. Sharma", confidence: 0.95, sourceLayer: "asr_transcript", timestampStart: 8.0, timestampEnd: 8.7 },
        { type: "action", rawValue: "cancel", normalizedValue: "cancel", confidence: 0.98, sourceLayer: "agent_interpretation", timestampStart: 6.0, timestampEnd: 6.5 },
      ],
      toolCall: {
        functionName: "cancel_appointment",
        arguments: { patient_name: "Amit Trivedi", doctor: "Dr. Sharma", date: "2026-08-15" },
        response: { success: true },
      },
    },
  ];

  for (const pc of passingCalls) {
    const call = await prisma.call.create({
      data: {
        auditId: audit1.id,
        transcript: pc.transcript,
        language: pc.language,
        status: "passed",
        summary: pc.summary,
      },
    });

    const entityIds: string[] = [];
    for (const ent of pc.entities) {
      const entity = await prisma.entity.create({
        data: { callId: call.id, ...ent },
      });
      entityIds.push(entity.id);
    }

    const tc = await prisma.toolCall.create({
      data: {
        callId: call.id,
        functionName: pc.toolCall.functionName,
        arguments: JSON.stringify(pc.toolCall.arguments),
        response: JSON.stringify(pc.toolCall.response),
      },
    });

    for (let i = 0; i < pc.entities.length; i++) {
      const ent = pc.entities[i];
      const toolArgs = pc.toolCall.arguments as unknown as Record<string, string>;
      let actualValue = ent.normalizedValue;

      if (ent.type === "date") actualValue = toolArgs.date || ent.normalizedValue;
      else if (ent.type === "time") actualValue = toolArgs.time || ent.normalizedValue;
      else if (ent.type === "name" && ent.rawValue.startsWith("Dr.")) actualValue = toolArgs.doctor || ent.normalizedValue;
      else if (ent.type === "name") actualValue = toolArgs.patient_name || toolArgs.patient_id || ent.normalizedValue;

      await prisma.comparison.create({
        data: {
          callId: call.id,
          entityId: entityIds[i],
          toolCallId: tc.id,
          expectedValue: ent.normalizedValue,
          actualValue,
          match: true,
          severity: "info",
        },
      });
    }
  }

  // ── Audit 2: QuickFix AC Service ──
  const audit2 = await prisma.audit.create({
    data: {
      name: "QuickFix AC Service",
      agentPrompt:
        "You are a service booking assistant for QuickFix AC repair. Help customers book AC service visits, provide estimates, and schedule technician visits.",
      status: "completed",
      totalCalls: 5,
      failedCalls: 1,
      failureRate: 0.2,
    },
  });

  // AC Call 1: FAIL — tool_argument_error (wrong address)
  const acCall1 = await prisma.call.create({
    data: {
      auditId: audit2.id,
      transcript:
        "Agent: QuickFix AC service, namaste.\nCustomer: Mera AC kharab hai. Service chahiye. Address hai 42, Nehru Nagar, Pune.\nAgent: Theek hai, technician bhej rahe hain 42 Nehru Nagar ko.\nCustomer: Haan, flat number 3B hai.\nAgent: Noted, kal subah aa jayega.",
      language: "hinglish",
      status: "failed",
      summary: "AC service booking — wrong flat number in system",
    },
  });

  const acE1 = await prisma.entity.create({
    data: {
      callId: acCall1.id,
      type: "address",
      rawValue: "42, Nehru Nagar, Pune, flat number 3B",
      normalizedValue: "42, Nehru Nagar, Flat 3B, Pune",
      confidence: 0.85,
      sourceLayer: "asr_transcript",
      timestampStart: 6.0,
      timestampEnd: 10.0,
    },
  });

  const acTc1 = await prisma.toolCall.create({
    data: {
      callId: acCall1.id,
      functionName: "book_service_visit",
      arguments: JSON.stringify({
        customer_name: "Customer",
        address: "42, Nehru Nagar, Pune",
        flat: "38",
        service_type: "AC repair",
        date: "2026-08-09",
      }),
      response: JSON.stringify({ success: true, booking_id: "SVC-101" }),
    },
  });

  await prisma.comparison.create({
    data: {
      callId: acCall1.id,
      entityId: acE1.id,
      toolCallId: acTc1.id,
      expectedValue: "Flat 3B",
      actualValue: "Flat 38",
      match: false,
      rootCause: "tool_argument_error",
      evidence:
        "Customer said 'flat number 3B' (three-B) but the tool call passed '38'. The ASR likely transcribed '3B' correctly but the agent's argument formatting converted the alphanumeric '3B' to numeric '38'.",
      severity: "critical",
    },
  });

  // AC Calls 2-5: PASS
  const acPassingCalls = [
    {
      transcript: "Agent: QuickFix AC.\nCustomer: AC servicing chahiye, 15 MG Road, Flat 7A, Bangalore.\nAgent: Booked for 15 MG Road, Flat 7A. Kal aayenge.\nCustomer: OK.",
      language: "hinglish",
      summary: "AC servicing booked at MG Road Bangalore",
    },
    {
      transcript: "Agent: QuickFix, hello.\nCustomer: My AC is leaking water. Address is 88 Park Street, Kolkata, Apartment 12.\nAgent: Noted, technician will visit 88 Park Street, Apartment 12 tomorrow.\nCustomer: Thank you.",
      language: "english",
      summary: "AC leak repair at Park Street Kolkata",
    },
    {
      transcript: "Agent: QuickFix AC service.\nCustomer: Window AC install karna hai. 23 Gandhi Road, Jaipur.\nAgent: Window AC installation 23 Gandhi Road, Jaipur. Parson aa jayenge.\nCustomer: Theek hai.",
      language: "hinglish",
      summary: "Window AC installation at Gandhi Road Jaipur",
    },
    {
      transcript: "Agent: Namaste, QuickFix.\nCustomer: AC gas refill chahiye. 5, Sector 22, Chandigarh.\nAgent: Gas refill booking done for Sector 22. Kal shaam tak.\nCustomer: Shukriya.",
      language: "hinglish",
      summary: "AC gas refill at Sector 22 Chandigarh",
    },
  ];

  for (const pc of acPassingCalls) {
    await prisma.call.create({
      data: {
        auditId: audit2.id,
        transcript: pc.transcript,
        language: pc.language,
        status: "passed",
        summary: pc.summary,
      },
    });
  }

  // ── Audit 3: MediLab Diagnostics (processing) ──
  const audit3 = await prisma.audit.create({
    data: {
      name: "MediLab Diagnostics",
      agentPrompt:
        "You are a lab test booking assistant for MediLab Diagnostics. Help patients book blood tests, scans, and other diagnostic tests.",
      status: "processing",
      totalCalls: 3,
      failedCalls: 0,
      failureRate: null,
    },
  });

  const labCalls = [
    {
      transcript: "Agent: MediLab Diagnostics.\nCustomer: Blood test karwana hai, CBC aur thyroid. Kal subah 8 baje aa sakti hoon?\nAgent: Haan, kal subah 8 baje aa jaiye. Khaali pet aana hai.\nCustomer: OK.",
      language: "hinglish",
      summary: "CBC + thyroid blood test booking for tomorrow 8 AM",
    },
    {
      transcript: "Agent: MediLab.\nCustomer: CT scan ka appointment chahiye next Wednesday. Dr. Rao ne recommend kiya hai.\nAgent: Wednesday ko CT scan slot available hai dopahar 2 baje. Book karun?\nCustomer: Haan, kar dijiye.",
      language: "hinglish",
      summary: "CT scan booking for Wednesday 2 PM, referred by Dr. Rao",
    },
    {
      transcript: "Agent: MediLab Diagnostics, good morning.\nCustomer: I need to book an MRI for my knee. Can I come this Saturday?\nAgent: Saturday morning we have a slot at 9:30 AM. Shall I book it?\nCustomer: Yes please.",
      language: "english",
      summary: "Knee MRI booking for Saturday 9:30 AM",
    },
  ];

  for (const lc of labCalls) {
    await prisma.call.create({
      data: {
        auditId: audit3.id,
        transcript: lc.transcript,
        language: lc.language,
        status: "pending",
        summary: lc.summary,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log(`  Audit 1: ${audit1.id} (10 calls, 3 failed)`);
  console.log(`  Audit 2: ${audit2.id} (5 calls, 1 failed)`);
  console.log(`  Audit 3: ${audit3.id} (3 calls, processing)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
