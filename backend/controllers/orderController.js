import prisma from "../utils/prismaClient.js";

export const createOrder = async (req, res) => {
  try {
    //citesc inputul din browserul clientului sau din Postman
    const { orderItems } = req.body;

    //validez lista de comenzi orderItems exista si nu e goala
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res
        .status(400)
        .json({ error: "orderItems must not be an empty array!" });
    }

    //transform datele ticketId si quantity din cosul clientului din string in int
    //un request JSON, fie din PROD env (de la client/browser) fie din Postman (QA) va fi trimis ca si string
    //iar ticketId si quano=ity sunt acceptate in DB doar ca int (schema.prisma)
    const normalized = orderItems.map((it) => ({
      ticketId: Number(it.ticketId),
      quantity: Number(it.quantity),
    }));

    //validez ca ticketId si quantity exista sub forma potrivita, pt un troubleshoot curat
    for (const it of normalized) {
      if (!it.ticketId || it.ticketId <= 0 || Number.isNaN(it.ticketId)) {
        return res
          .status(400)
          .json({ error: "Invalid ticketId in orderItems." });
      }
      if (!it.quantity || it.quantity <= 0 || Number.isNaN(it.quantity)) {
        return res
          .status(400)
          .json({ error: "Invalid quantity in orderItems." });
      }
    }

    //normalizez din nou ticketId-ul/-urile din req.body normalizat si filtrez dupa el/ele in baza de date, ca sa vad daca exista
    //se resupune ca la aceasta etapa am deja event-ul si tichetele inregistrate de catre un event_planner
    const ticketIds = normalized.map((x) => x.ticketId);

    const tickets = await prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
    });

    if (tickets.length !== ticketIds.length) {
      return res
        .status(400)
        .json({ error: "One or more tickets do not exist." });
    }

    for (const it of normalized) {
      const t = tickets.find((x) => x.id === it.ticketId);
      if (t.quantity < it.quantity) {
        return res.status(400).json({
          error: `Not enough stock for ticket "${t.name}". Availability: ${t.quantity}`,
        });
      }
    }

    //aici calculez totalul comenzii (pretul, din DB, al tichetului/tichetelor ori tichetele comandate)
    let total = 0;
    for (const it of normalized) {
      const t = tickets.find((x) => x.id === it.ticketId);
      total += t.price * it.quantity;
    }

    //
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          status: "PENDING",
        },
      });

      //
      for (const it of normalized) {
        const t = tickets.find((x) => x.id === it.ticketId);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            ticketId: t.id,
            quantity: it.quantity,
            unitPrice: t.price,
          },
        });

        await tx.ticket.update({
          where: { id: t.id },
          data: { quantity: { decrement: it.quantity } },
        });
      }

      return order;
    });

    return res
      .status(201)
      .json({ message: "Order placed with success!", order: createdOrder });
  } catch (error) {
    console.error("createOrder error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//GET --> userul logat isi poate vedea toate comenzile lui
export const listMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: { include: { ticket: true } },
      },
    });

    return res.json({ count: orders.length, orders });
  } catch (error) {
    console.error("listMyOrders error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//userul logat isi poate vedea toate comenzile lui dupa id
export const getMyOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid order id." });
    }

    const order = await prisma.order.findMany({
      where: { id },
      include: { orderItems: { include: { ticket: true } } },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found!" });
    }

    //ne asiguram ca admin-ul vede comenzile, cat si userul logat
    const isAdmin = req.user.role === "ADMIN";
    const isOwner = order.userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ error: "You are not allowed to see this users' orders!" });
    }

    return res.json({ order });
  } catch (error) {
    console.error("getMyOrderById error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//DEBUG --> doar ADMIN-ul foloseste functia asta strict pentru QA
export const listAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        orderItems: { include: { ticket: true } },
      },
    });

    return res.json({ count: orders.length, orders });
  } catch (error) {
    console.error("listAllOrders error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//DEBUG only --> pentru partea de QA ca sa verificam business flow-ul
//PATCH --> doar ADMINUL o poate folosi pentru a schimba statusul comenzilor
export const updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    //conditii necesare in caz de eroare ca sa opresc executia codului la timp si sa depistez problema mai usor
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid order id." });
    }

    if (!status) {
      return res.status(400).json({ error: "status is required!" });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Order does not exist." });
    }

    //se face update in DB la statusul comenzii dorite
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.json({
      message: "Order status has been updated.",
      order: status,
    });
  } catch (error) {
    console.error("updateOrderStatus error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
