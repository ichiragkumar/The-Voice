const ITEMS = [
  { item: "Wireless Earbuds", amount: 1499 },
  { item: "Running Shoes", amount: 2999 },
  { item: "Phone Case", amount: 899 },
  { item: "USB-C Cable", amount: 349 },
  { item: "Laptop Stand", amount: 1899 },
  { item: "Bluetooth Speaker", amount: 2499 },
  { item: "Power Bank", amount: 1299 },
  { item: "Smartwatch Band", amount: 599 },
];

const STATUSES = ["not_dispatched", "not_dispatched", "shipped", "shipped", "delivered"];
const METHODS = ["cod", "upi", "card", "upi", "card"];

export function generateDemoOrders(userId: string, address: string) {
  const shuffled = [...ITEMS].sort(() => Math.random() - 0.5).slice(0, 5);

  return shuffled.map((item, i) => ({
    userId,
    orderId: `ORD-${1000 + Math.floor(Math.random() * 9000)}`,
    item: item.item,
    amount: item.amount,
    status: STATUSES[i],
    method: METHODS[i],
    address,
    tracking: STATUSES[i] === "shipped" ? `DL${100000 + Math.floor(Math.random() * 900000)}` : null,
  }));
}
