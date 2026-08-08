"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion-wrapper";
import { ShoppingCart, MessageSquare } from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  orderId: string;
  item: string;
  amount: number;
  status: string;
  method: string;
  address: string;
  tracking: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  not_dispatched: "bg-amber-500/20 text-amber-400",
  shipped: "bg-blue-500/20 text-blue-400",
  delivered: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then(setOrders);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-500" /> My Orders
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{orders.length} orders</p>
          </div>
          <Link href="/chat">
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <MessageSquare className="h-4 w-4" /> Chat with Agent
            </Button>
          </Link>
        </div>
      </FadeIn>

      <div className="grid gap-3 sm:grid-cols-2">
        {orders.map((order, i) => (
          <FadeIn key={order.id} delay={i * 0.05}>
            <Card className="hover:border-emerald-500/20 transition-all">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.item}</p>
                    <p className="text-xs text-muted-foreground font-mono">{order.orderId}</p>
                  </div>
                  <Badge variant="outline" className={STATUS_COLORS[order.status] || ""}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹{order.amount}</span>
                  <span>{order.method.toUpperCase()}</span>
                </div>
                {order.tracking && (
                  <p className="text-[10px] text-muted-foreground">Tracking: {order.tracking}</p>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
