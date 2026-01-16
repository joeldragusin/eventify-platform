import prisma from "../utils/prismaClient.js";

//GET the tickets associated to an event(we query the Events table from Tickets table, meaning we filter based on a FK)
export const listTickets = async (req, res) => {
  try {
    const eventId = req.query.eventId ? Number(req.query.eventId) : null;

    if (!eventId || Number.isNaN(req.query.eventId)) {
      return res
        .status(400)
        .json({ error: "eventId query param is required as a number!" });
    }

    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      orderBy: { id: "desc" },
    });

    return res.json({ count: tickets.lenght, tickets });
  } catch (error) {
    console.error("listTickets error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//POST or create a ticket
export const createTicket = async (req, res) => {
  try {
    const { name, price, quantity, eventId } = req.body;

    //We validate all required/requested input introduced
    if (!name || price == undefined || quantity == undefined || !eventId) {
      return res.status(400).json({
        error: "name, price, quantity and eventId are all required fields!",
      });
    }
    //I double check the nature of eventId before querying the DB and messing it up
    const eventIdNum = Number(eventId);
    if (eventIdNum <= 0 || Number.isNaN(eventIdNum)) {
      return res.status(400).json({ error: "Invalid eventId." });
    }

    //Dau un search in tabela Events
    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    //Then, only when user is an ADMIN or EVENT_PLANNER
    const isAdmin = req.user.role === "ADMIN";
    const isOwner = event.plannerId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed." });
    }

    //Create an event based on conditions from above
    const ticket = await prisma.ticket.create({
      data: {
        name,
        price: Number(price),
        quantity: Number(quantity),
        eventId: eventIdNum,
      },
    });

    return res.status(201).json({ message: "Ticket created.", ticket });
  } catch (error) {
    console.error("createTicket error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//PATCH aka update an existing ticket by using the id within the URL
export const updateTicket = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ticket id." });
    }

    //Find the ticket in the tickets table
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    //Find the event to check ownership
    const event = await prisma.event.findUnique({
      where: { id: ticket.eventId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Event not found." });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = event.plannerId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed." });
    }

    //The update itself
    const { name, price, quantity } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (quantity !== undefined) data.quantity = Number(quantity);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data,
    });

    return res.json({ message: "Ticket updated.", ticket: updated });
  } catch (error) {
    console.error("updateTicket error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ticket id." });
    }

    //Find the ticket
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    //Delete the ticket only if you are admin or event_planner
    const event = await prisma.event.findUnique({
      where: { id: ticket.eventId },
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = event.plannerId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed." });
    }

    await prisma.ticket.delete({ where: { id } });

    return res.json({ message: "Ticket deleted." });
  } catch (error) {
    console.error("deleteTicket error: ", error);
    return res.status(500).json();
  }
};

//for DEBUG purposes ONLY
//GET all tickets only for roles like ADMIN or EVENT_PLANNER
export const listAllTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { id: "desc" },
    });

    return res.json({ count: tickets.length, tickets });
  } catch (error) {
    console.error("listAllTickets error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
