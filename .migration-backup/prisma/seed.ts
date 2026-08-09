import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
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

  // ── Audit 4: E-commerce Cancellation & Refund Pack ──
  const audit4 = await prisma.audit.create({
    data: {
      name: "ShopEasy - Cancellation & Refund Audit",
      agentPrompt:
        "You are a customer support agent for ShopEasy e-commerce. Help customers cancel orders, process refunds, reschedule deliveries, and change addresses. Refunds go to original payment method unless customer requests otherwise. Cancellation is only allowed before shipping.",
      status: "completed",
      totalCalls: 8,
      failedCalls: 3,
      failureRate: 0.375,
    },
  });

  // E-com Call 1: FAIL — reasoning_error (wrong refund amount)
  const ecomCall1 = await prisma.call.create({
    data: {
      auditId: audit4.id,
      transcript:
        "Agent: ShopEasy customer support, namaste.\nCustomer: Mera order cancel karna hai. Order number one four double nine hai.\nAgent: Order #1499 mil gaya. Isme do items hain — ek shirt ₹899 aur ek belt ₹450. Kaunsa cancel karna hai?\nCustomer: Sirf shirt cancel karo, belt rehne do.\nAgent: Theek hai, shirt cancel kar diya. ₹1349 refund ho jayega 5-7 din mein.\nCustomer: Theek hai.",
      language: "hinglish",
      status: "failed",
      summary: "Partial cancellation — agent refunded total instead of shirt only",
    },
  });

  const ecomE1_1 = await prisma.entity.create({
    data: {
      callId: ecomCall1.id,
      type: "name",
      rawValue: "one four double nine",
      normalizedValue: "1499",
      confidence: 0.85,
      sourceLayer: "asr_transcript",
      timestampStart: 5.0,
      timestampEnd: 6.5,
    },
  });

  const ecomE1_2 = await prisma.entity.create({
    data: {
      callId: ecomCall1.id,
      type: "amount",
      rawValue: "₹899 (shirt only)",
      normalizedValue: "899",
      confidence: 0.9,
      sourceLayer: "agent_interpretation",
      timestampStart: 10.0,
      timestampEnd: 11.0,
    },
  });

  const ecomE1_3 = await prisma.entity.create({
    data: {
      callId: ecomCall1.id,
      type: "action",
      rawValue: "sirf shirt cancel karo",
      normalizedValue: "partial_cancel",
      confidence: 0.9,
      sourceLayer: "agent_interpretation",
      timestampStart: 12.0,
      timestampEnd: 13.5,
    },
  });

  const ecomTc1 = await prisma.toolCall.create({
    data: {
      callId: ecomCall1.id,
      functionName: "cancel_order_item",
      arguments: JSON.stringify({
        order_id: "1499",
        item: "shirt",
        refund_amount: 1349,
        refund_method: "original_payment",
      }),
      response: JSON.stringify({ success: true, refund_id: "RF-2001" }),
    },
  });

  await prisma.comparison.createMany({
    data: [
      {
        callId: ecomCall1.id,
        entityId: ecomE1_2.id,
        toolCallId: ecomTc1.id,
        expectedValue: "899",
        actualValue: "1349",
        match: false,
        rootCause: "reasoning_error",
        evidence:
          "Customer requested partial cancellation of shirt only (₹899). Agent correctly identified the item but passed the total order amount (₹1349 = ₹899 + ₹450) as refund instead of the shirt price alone.",
        severity: "critical",
      },
      {
        callId: ecomCall1.id,
        entityId: ecomE1_1.id,
        toolCallId: ecomTc1.id,
        expectedValue: "1499",
        actualValue: "1499",
        match: true,
        severity: "info",
      },
    ],
  });

  // E-com Call 2: FAIL — tool_argument_error (wrong refund method)
  const ecomCall2 = await prisma.call.create({
    data: {
      auditId: audit4.id,
      transcript:
        "Agent: ShopEasy support.\nCustomer: Mera refund UPI par chahiye, account mein nahi. Order 2310 ka.\nAgent: Theek hai, ₹1200 refund UPI par process kar diya.\nCustomer: PhonePe par aayega na?\nAgent: Haan ji, PhonePe par aa jayega.",
      language: "hinglish",
      status: "failed",
      summary: "Customer requested UPI refund but system processed to bank account",
    },
  });

  const ecomE2_1 = await prisma.entity.create({
    data: {
      callId: ecomCall2.id,
      type: "action",
      rawValue: "refund UPI par chahiye, account mein nahi",
      normalizedValue: "refund_upi",
      confidence: 0.95,
      sourceLayer: "asr_transcript",
      timestampStart: 4.0,
      timestampEnd: 6.5,
    },
  });

  const ecomE2_2 = await prisma.entity.create({
    data: {
      callId: ecomCall2.id,
      type: "amount",
      rawValue: "₹1200",
      normalizedValue: "1200",
      confidence: 0.98,
      sourceLayer: "asr_transcript",
      timestampStart: 8.0,
      timestampEnd: 8.5,
    },
  });

  const ecomTc2 = await prisma.toolCall.create({
    data: {
      callId: ecomCall2.id,
      functionName: "process_refund",
      arguments: JSON.stringify({
        order_id: "2310",
        amount: 1200,
        method: "bank_account",
      }),
      response: JSON.stringify({ success: true, refund_id: "RF-2002" }),
    },
  });

  await prisma.comparison.createMany({
    data: [
      {
        callId: ecomCall2.id,
        entityId: ecomE2_1.id,
        toolCallId: ecomTc2.id,
        expectedValue: "upi",
        actualValue: "bank_account",
        match: false,
        rootCause: "tool_argument_error",
        evidence:
          "Customer explicitly said 'UPI par chahiye, account mein nahi' (want it on UPI, not bank account). Agent verbally confirmed UPI/PhonePe but the tool call passed 'bank_account' as the refund method.",
        severity: "critical",
      },
      {
        callId: ecomCall2.id,
        entityId: ecomE2_2.id,
        toolCallId: ecomTc2.id,
        expectedValue: "1200",
        actualValue: "1200",
        match: true,
        severity: "info",
      },
    ],
  });

  // E-com Call 3: FAIL — false_confirmation (delivery date)
  const ecomCall3 = await prisma.call.create({
    data: {
      auditId: audit4.id,
      transcript:
        "Agent: ShopEasy delivery support.\nCustomer: Kal nahi, parson deliver karna mera order. Order ID 3847.\nAgent: Aapka delivery parson ke liye reschedule kar diya hai.\nCustomer: Pakka parson aayega?\nAgent: Haan ji, pakka parson.",
      language: "hinglish",
      status: "failed",
      summary: "Agent confirmed day-after-tomorrow but scheduled for tomorrow",
    },
  });

  const ecomE3_1 = await prisma.entity.create({
    data: {
      callId: ecomCall3.id,
      type: "date",
      rawValue: "parson",
      normalizedValue: "2026-08-10",
      confidence: 0.88,
      sourceLayer: "asr_transcript",
      timestampStart: 4.5,
      timestampEnd: 5.0,
    },
  });

  const ecomTc3 = await prisma.toolCall.create({
    data: {
      callId: ecomCall3.id,
      functionName: "reschedule_delivery",
      arguments: JSON.stringify({
        order_id: "3847",
        new_date: "2026-08-09",
      }),
      response: JSON.stringify({ success: true }),
    },
  });

  await prisma.comparison.create({
    data: {
      callId: ecomCall3.id,
      entityId: ecomE3_1.id,
      toolCallId: ecomTc3.id,
      expectedValue: "2026-08-10",
      actualValue: "2026-08-09",
      match: false,
      rootCause: "false_confirmation",
      evidence:
        "Customer said 'kal nahi, parson' (not tomorrow, day after). Agent verbally confirmed 'parson' but the tool call scheduled for tomorrow (Aug 9) instead of day-after-tomorrow (Aug 10).",
      severity: "critical",
    },
  });

  // E-com Calls 4-8: PASS
  const ecomPassingCalls = [
    {
      transcript: "Agent: ShopEasy support.\nCustomer: Cancel kar do order 5521. Abhi tak ship nahi hua.\nAgent: Order 5521 cancel kar diya. ₹2,499 refund 5-7 din mein.\nCustomer: OK thanks.",
      language: "hinglish",
      summary: "Full order cancellation — correct",
    },
    {
      transcript: "Agent: ShopEasy.\nCustomer: I want to return the headphones from order 6623. They're defective.\nAgent: Return initiated for headphones from order 6623. Pickup scheduled for tomorrow.\nCustomer: Thank you.",
      language: "english",
      summary: "Return initiated for defective item — correct",
    },
    {
      transcript: "Agent: ShopEasy delivery help.\nCustomer: Address change karna hai order 7712 ka. Naya address hai 15, Koramangala 4th Block, Bangalore.\nAgent: Address updated to 15, Koramangala 4th Block, Bangalore.\nCustomer: Sahi hai, dhanyavaad.",
      language: "hinglish",
      summary: "Delivery address change — correct",
    },
    {
      transcript: "Agent: ShopEasy support, namaste.\nCustomer: Mujhe COD se prepaid mein change karna hai. Order 8834.\nAgent: Payment method COD se prepaid mein change kar diya. UPI link bhej rahi hoon.\nCustomer: Theek hai.",
      language: "hinglish",
      summary: "COD to prepaid conversion — correct",
    },
    {
      transcript: "Agent: Hello, ShopEasy.\nCustomer: Where is my order 9901? It was supposed to arrive yesterday.\nAgent: Order 9901 is out for delivery. Expected by 6 PM today.\nCustomer: Alright.",
      language: "english",
      summary: "Order tracking inquiry — correct",
    },
  ];

  for (const pc of ecomPassingCalls) {
    await prisma.call.create({
      data: {
        auditId: audit4.id,
        transcript: pc.transcript,
        language: pc.language || "hinglish",
        status: "passed",
        summary: pc.summary,
      },
    });
  }

  // ── Audit 5: Collections Promise-to-Pay Pack ──
  const audit5 = await prisma.audit.create({
    data: {
      name: "FinServ Collections - PTP Audit",
      agentPrompt:
        "You are a collections agent for FinServ lending. Remind customers about overdue EMIs, capture promise-to-pay dates and amounts, and log payment commitments. Be polite but firm.",
      status: "completed",
      totalCalls: 5,
      failedCalls: 2,
      failureRate: 0.4,
    },
  });

  // Collections Call 1: FAIL — asr_error (wrong amount)
  const colCall1 = await prisma.call.create({
    data: {
      auditId: audit5.id,
      transcript:
        "Agent: FinServ collections se bol raha hoon. Aapka ₹15,000 ka EMI pending hai.\nCustomer: Haan pata hai. Teen hazaar abhi de dunga, baaki parson.\nAgent: Theek hai, ₹13,000 aaj aur baaki parson.\nCustomer: Nahi nahi, teen hazaar! T-E-E-N hazaar. 3000.\nAgent: Oh sorry, ₹3,000 aaj. Noted.",
      language: "hinglish",
      status: "failed",
      summary: "ASR confused 'teen hazaar' (3000) with 'tera hazaar' (13000)",
    },
  });

  const colE1_1 = await prisma.entity.create({
    data: {
      callId: colCall1.id,
      type: "amount",
      rawValue: "teen hazaar",
      normalizedValue: "3000",
      confidence: 0.7,
      sourceLayer: "asr_transcript",
      timestampStart: 8.0,
      timestampEnd: 9.0,
    },
  });

  const colE1_2 = await prisma.entity.create({
    data: {
      callId: colCall1.id,
      type: "date",
      rawValue: "parson",
      normalizedValue: "2026-08-10",
      confidence: 0.85,
      sourceLayer: "asr_transcript",
      timestampStart: 10.0,
      timestampEnd: 10.5,
    },
  });

  const colTc1 = await prisma.toolCall.create({
    data: {
      callId: colCall1.id,
      functionName: "log_promise_to_pay",
      arguments: JSON.stringify({
        customer_id: "CUST-5501",
        amount_today: 13000,
        amount_later: 2000,
        later_date: "2026-08-10",
      }),
      response: JSON.stringify({ success: true, ptp_id: "PTP-301" }),
    },
  });

  await prisma.comparison.create({
    data: {
      callId: colCall1.id,
      entityId: colE1_1.id,
      toolCallId: colTc1.id,
      expectedValue: "3000",
      actualValue: "13000",
      match: false,
      rootCause: "asr_error",
      evidence:
        "Customer said 'teen hazaar' (3,000) but ASR initially heard 'tera hazaar' (13,000). In Hindi, 'teen' (3) and 'tera' (13) are phonetically close. Customer had to spell it out before correction.",
      severity: "critical",
    },
  });

  // Collections Call 2: FAIL — reasoning_error (wrong PTP date)
  const colCall2 = await prisma.call.create({
    data: {
      auditId: audit5.id,
      transcript:
        "Agent: FinServ collections. Aapka ₹8,500 EMI overdue hai.\nCustomer: Salary aane do, uske agle din de dunga. Salary 15 ko aati hai.\nAgent: Theek hai, 15 August ko payment note kar liya.\nCustomer: Nahi, 15 ko salary aayegi, uske agle din — 16 ko dunga.",
      language: "hinglish",
      status: "failed",
      summary: "PTP date should be 16th (day after salary) not 15th",
    },
  });

  const colE2_1 = await prisma.entity.create({
    data: {
      callId: colCall2.id,
      type: "date",
      rawValue: "uske agle din (after 15th salary)",
      normalizedValue: "2026-08-16",
      confidence: 0.75,
      sourceLayer: "asr_transcript",
      timestampStart: 8.0,
      timestampEnd: 10.0,
    },
  });

  const colTc2 = await prisma.toolCall.create({
    data: {
      callId: colCall2.id,
      functionName: "log_promise_to_pay",
      arguments: JSON.stringify({
        customer_id: "CUST-5502",
        amount: 8500,
        promise_date: "2026-08-15",
      }),
      response: JSON.stringify({ success: true, ptp_id: "PTP-302" }),
    },
  });

  await prisma.comparison.create({
    data: {
      callId: colCall2.id,
      entityId: colE2_1.id,
      toolCallId: colTc2.id,
      expectedValue: "2026-08-16",
      actualValue: "2026-08-15",
      match: false,
      rootCause: "reasoning_error",
      evidence:
        "Customer said 'salary 15 ko aati hai, uske agle din de dunga' — meaning payment on 16th (day after salary on 15th). Agent logged PTP for 15th, the salary date, not the promised payment date.",
      severity: "critical",
    },
  });

  // Collections Calls 3-5: PASS
  const colPassingCalls = [
    {
      transcript: "Agent: FinServ collections.\nCustomer: Haan, ₹5,000 kal de dunga pakka.\nAgent: ₹5,000 kal, 9 August. Note kar liya.\nCustomer: Haan.",
      language: "hinglish",
      summary: "PTP ₹5,000 tomorrow — correct",
    },
    {
      transcript: "Agent: FinServ.\nCustomer: I already paid yesterday via NEFT. Reference number NEFT2026080712345.\nAgent: Let me check. Yes, ₹12,000 received yesterday. Your account is updated.\nCustomer: Thank you.",
      language: "english",
      summary: "Payment confirmation — correct",
    },
    {
      transcript: "Agent: FinServ collections se.\nCustomer: Monday ko full payment kar dunga. Poora ₹22,000.\nAgent: ₹22,000 Monday 11 August. Noted.\nCustomer: Haan ji.",
      language: "hinglish",
      summary: "PTP full payment Monday — correct",
    },
  ];

  for (const pc of colPassingCalls) {
    await prisma.call.create({
      data: {
        auditId: audit5.id,
        transcript: pc.transcript,
        language: pc.language || "hinglish",
        status: "passed",
        summary: pc.summary,
      },
    });
  }

  // ── Audit 6: Insurance Servicing Pack ──
  const audit6 = await prisma.audit.create({
    data: {
      name: "SecureLife Insurance - Policy Servicing",
      agentPrompt:
        "You are a policy servicing agent for SecureLife Insurance. Help customers with premium payments, policy details, nominee changes, and claim status. Always verify policy number before making changes.",
      status: "completed",
      totalCalls: 4,
      failedCalls: 1,
      failureRate: 0.25,
    },
  });

  // Insurance Call 1: FAIL — integration_error (nominee not updated)
  const insCall1 = await prisma.call.create({
    data: {
      auditId: audit6.id,
      transcript:
        "Agent: SecureLife Insurance, namaste.\nCustomer: Meri policy mein nominee change karna hai. Policy number SL-2024-78432.\nAgent: Policy mil gayi. Current nominee Sunita Devi hai. Naya nominee kaun hoga?\nCustomer: Mera beta Rahul Kumar. Date of birth 15 March 1998.\nAgent: Rahul Kumar, DOB 15 March 1998 — nominee update ho gaya.\nCustomer: Dhanyavaad.",
      language: "hinglish",
      status: "failed",
      summary: "Agent confirmed nominee change but backend still shows old nominee",
    },
  });

  const insE1_1 = await prisma.entity.create({
    data: {
      callId: insCall1.id,
      type: "name",
      rawValue: "Rahul Kumar",
      normalizedValue: "Rahul Kumar",
      confidence: 0.95,
      sourceLayer: "asr_transcript",
      timestampStart: 12.0,
      timestampEnd: 13.0,
    },
  });

  const insTc1 = await prisma.toolCall.create({
    data: {
      callId: insCall1.id,
      functionName: "update_nominee",
      arguments: JSON.stringify({
        policy_id: "SL-2024-78432",
        nominee_name: "Rahul Kumar",
        nominee_dob: "1998-03-15",
        relationship: "son",
      }),
      response: JSON.stringify({ success: false, error: "POLICY_LOCKED_FOR_REVIEW" }),
    },
  });

  await prisma.comparison.create({
    data: {
      callId: insCall1.id,
      entityId: insE1_1.id,
      toolCallId: insTc1.id,
      expectedValue: "Rahul Kumar",
      actualValue: "Sunita Devi (unchanged)",
      match: false,
      rootCause: "integration_error",
      evidence:
        "Agent called update_nominee with correct arguments, but the API returned POLICY_LOCKED_FOR_REVIEW error. Agent ignored the error response and told the customer the update was done. Backend still shows Sunita Devi as nominee.",
      severity: "critical",
    },
  });

  // Insurance Calls 2-4: PASS
  const insPassingCalls = [
    {
      transcript: "Agent: SecureLife.\nCustomer: Meri policy SL-2024-55210 ka premium kab due hai?\nAgent: Aapka next premium ₹12,500 hai, due date 1 September 2026.\nCustomer: OK, time par kar dunga.",
      language: "hinglish",
      summary: "Premium due date inquiry — correct",
    },
    {
      transcript: "Agent: SecureLife Insurance.\nCustomer: Claim status chahiye. Claim number CL-2026-1234.\nAgent: Claim CL-2026-1234 is under review. Expected settlement by August 20th.\nCustomer: Thank you.",
      language: "english",
      summary: "Claim status inquiry — correct",
    },
    {
      transcript: "Agent: SecureLife, namaste.\nCustomer: Policy SL-2024-90021 ka address change karna hai. Naya address 42 MG Road, Pune 411001.\nAgent: Address updated to 42 MG Road, Pune 411001.\nCustomer: Shukriya.",
      language: "hinglish",
      summary: "Address change on policy — correct",
    },
  ];

  for (const pc of insPassingCalls) {
    await prisma.call.create({
      data: {
        auditId: audit6.id,
        transcript: pc.transcript,
        language: pc.language || "hinglish",
        status: "passed",
        summary: pc.summary,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log(`  Audit 1: ${audit1.id} (10 calls, 3 failed) — Appointment`);
  console.log(`  Audit 2: ${audit2.id} (5 calls, 1 failed) — AC Service`);
  console.log(`  Audit 3: ${audit3.id} (3 calls, processing) — Diagnostics`);
  console.log(`  Audit 4: ${audit4.id} (8 calls, 3 failed) — E-commerce`);
  console.log(`  Audit 5: ${audit5.id} (5 calls, 2 failed) — Collections`);
  console.log(`  Audit 6: ${audit6.id} (4 calls, 1 failed) — Insurance`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
