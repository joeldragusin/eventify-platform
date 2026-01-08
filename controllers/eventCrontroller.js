import {
  PrismaClientKnownRequestError,
  warnEnvConflicts,
} from "@prisma/client/runtime/library";
import prisma from "../utils/prismaClient.js";

//GET all events for QA testing
export const listEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        venue: true,
        planner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return res.json({
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("listEvents error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//POST events created
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      capacity,
      price,
      venueId,
      image,
      category,
    } = req.body;

    //Input validation
    if (!title || !date || !time || !capacity || !price) {
      return res.status(400).json({
        error: "Title, Date, Time, Capacity and Price are required!",
      });
    }

    //input data to be later inserted into the DB
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        time,
        capacity: Number(capacity),
        price: Number(price),
        plannerId: req.user.id,
        venueId: venueId ? Number(venueId) : null,
        image: image || null,
        category: category || null,
      },
    });

    return res.status(201).json({
      message: "Event created successfully!",
      event,
    });
  } catch (error) {
    console.error("createEvent error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const getEventById = async (req, res) => {
  try {
    //we use the Express function called params, which extracts the real ID from the associated URL request
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Invalid event id." });
    }

    //we search for the id against the DB
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        planner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    return res.json({ event });
  } catch (error) {
    console.error("getEventById error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const updateEvent = async (req, res) => {
  try {
    //we taek the URL id for the event, turn it into an int and check for its existence
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid event id. It must be an integer." });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    //who has admin role and who is the event owner
    const isAdmin = req.user.role === "ADMIN";
    const isOwner = event.plannerId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed." });
    }

    const {
      title,
      description,
      date,
      time,
      capacity,
      price,
      image,
      category,
      venueId,
    } = req.body;

    const data = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (date !== undefined) data.date = new Date(date);
    if (time !== undefined) data.time = time;
    if (capacity !== undefined) data.capacity = Number(capacity);
    if (price !== undefined) data.price = Number(price);

    if (image !== undefined) data.image = image || null;
    if (category !== undefined) data.category = category || null;
    if (venueId !== undefined) data.venueId = venueId ? Number(venueId) : null;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const updated = await prisma.event.update({
      where: { id },
      data,
    });

    return res.json({ message: "Event has been updated.", event: updated });
  } catch (error) {
    console.error("updateEvent error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid event id. It must be an integer!" });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = event.plannerId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed." });
    }

    await prisma.event.delete({ where: { id } });

    return res.json({ message: "Event deleted." });
  } catch (error) {
    console.error("deleteEvent error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
