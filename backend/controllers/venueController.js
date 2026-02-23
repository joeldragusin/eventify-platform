import prisma from "../utils/prismaClient.js";

//GET api/venues aka list all venues inside the DB
export const listVenues = async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { id: "desc" },
    });

    return res.json({ count: venues.length, venues });
  } catch (error) {
    console.error("listVenues error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//POST aka create a venue
export const createVenue = async (req, res) => {
  try {
    const { name, address } = req.body;

    //
    if (!name || !address) {
      return res
        .status(400)
        .json({ error: "Both venue and address are required!" });
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        address,
      },
    });

    return res
      .status(201)
      .json({ message: "Venue created successfully.", venue });
  } catch (error) {
    console.error("createVenue error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
