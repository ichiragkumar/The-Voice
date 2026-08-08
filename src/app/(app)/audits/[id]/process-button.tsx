"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { processAudit } from "@/actions/process-actions";

export function ProcessButton({
  auditId,
  status,
}: {
  auditId: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleProcess() {
    setLoading(true);
    try {
      await processAudit(auditId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleProcess}
      disabled={loading || status === "processing"}
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" /> Process Audit
        </>
      )}
    </Button>
  );
}
