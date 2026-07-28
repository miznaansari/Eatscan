import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderEvents } from "@/lib/sseManager";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mobileNo,
      name,
      restaurantId,
      tableUid,
      items,
      specialNotes,
      paymentMethod = "CASH",
    } = body;

    if (!mobileNo || !restaurantId || !items || !items.length) {
      return NextResponse.json(
        { error: "Mobile number, restaurant, and order items are required" },
        { status: 400 }
      );
    }

    // 1. Resolve or Create Customer linked to this Restaurant
    let customer = await prisma.customer.findFirst({
      where: { mobileNo: mobileNo.trim() },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          mobileNo: mobileNo.trim(),
          name: name ? name.trim() : "Guest Diner",
          createdFromRestaurantId: restaurantId,
          isVerifiedMobileNo: true,
        },
      });
    }

    // 2. Resolve QR Table if provided
    let qrTable = null;
    if (tableUid) {
      qrTable = await prisma.qrManagement.findFirst({
        where: { uid: tableUid, restaurantId },
      });
    }

    // 3. Calculate Totals
    let totalAmount = 0;
    const formattedItems = items.map((item) => {
      const price = parseFloat(item.itemPrice || item.price);
      const qty = parseInt(item.quantity || 1, 10);
      const subTotal = price * qty;
      totalAmount += subTotal;

      return {
        menuId: item.menuId || null,
        itemName: item.itemName || item.name,
        itemPrice: price,
        quantity: qty,
        subTotal: subTotal,
        specialInstructions: item.specialInstructions || null,
      };
    });

    const taxAmount = totalAmount * 0.05; // 5% GST
    const grandTotal = totalAmount + taxAmount;
    const orderNumber = `ES-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Save Customer Order and Items
    const newOrder = await prisma.customerOrder.create({
      data: {
        orderNumber,
        customerId: customer.id,
        restaurantId: restaurantId,
        qrTableId: qrTable ? qrTable.id : null,
        totalAmount: totalAmount,
        taxAmount: taxAmount,
        grandTotal: grandTotal,
        orderStatus: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: paymentMethod,
        specialNotes: specialNotes || null,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
        customer: true,
        qrTable: true,
        restaurant: true,
      },
    });

    // 5. Trigger Real-Time SSE Notification to Manager PWA
    orderEvents.emit("new-order", {
      restaurantId: restaurantId,
      order: {
        id: newOrder.id,
        uid: newOrder.uid,
        orderNumber: newOrder.orderNumber,
        tableTitle: qrTable ? qrTable.tableTitle : "Direct Order",
        customerName: customer.name,
        customerMobile: customer.mobileNo,
        grandTotal: newOrder.grandTotal,
        orderStatus: newOrder.orderStatus,
        itemCount: newOrder.items.length,
        createdAt: newOrder.createdAt,
        items: newOrder.items,
      },
    });

    return NextResponse.json({
      success: true,
      orderUid: newOrder.uid,
      orderNumber: newOrder.orderNumber,
      grandTotal: newOrder.grandTotal,
      message: "Order placed successfully!",
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
