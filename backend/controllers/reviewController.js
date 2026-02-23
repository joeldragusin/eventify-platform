import prisma from "../utils/prismaClient.js";

//POST --> creez un review
//dpmdv am nevoie de urmatorul input: event(deci de eventId), rating(1->5 stele) si un comentariu(string)
//am nevoie sa fiu autentificat cu userul meu ca sa ma loghez (deci cu userId)
export const createReview = async (req, res) => {
  try {
    //the input is taken from the browser
    const { eventId, rating, comment } = req.body;

    //i validate the eventId exists
    const eventIdNum = Number(eventId);
    if (!eventIdNum || eventIdNum <= 0 || Number.isNaN(eventIdNum)) {
      return res.status(400).json({ error: "Invalid eventId" });
    }

    //i validate the rating to be from 1 to 5
    const ratingNum = Number(rating);
    if (
      !ratingNum ||
      Number.isNaN(ratingNum) ||
      ratingNum < 1 ||
      ratingNum > 5
    ) {
      return res
        .status(400)
        .json({ error: "Rating must be between 1 and 5 stars." });
    }

    //verifica daca eventul exista in DB
    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
      select: { id: true },
    });

    if (!event) {
      return res
        .status(404)
        .json({ error: "Event is not created in the database." });
    }

    //regula prin care doar un review per user per event poate exista/poate fi creat
    const existing = await prisma.review.findFirst({
      where: { eventId: eventIdNum, userId: req.user.id },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "You already created a review for this event!" });
    }

    //creez review-ul in dtaabase aka il inregistrez in database
    const review = await prisma.review.create({
      data: {
        eventId: eventIdNum,
        userId: req.user.id,
        rating: ratingNum,
        comment: comment || null,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return res
      .status(201)
      .json({ message: "Review has been created.", review });
  } catch (error) {
    console.error("createReview error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const listReviewsByEvent = async (req, res) => {
  try {
    const eventIdRev = req.query.eventId;

    if (!eventIdRev) {
      return res.status(400).json({
        error: "eventId query parameter is required (number).",
      });
    }

    const eventIdNum = Number(eventIdRev);
    if (Number.isNaN(eventIdNum) || eventIdNum <= 0) {
      return res.status(400).json({
        error: "eventId query param must be a positive number.",
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
      select: { id: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const reviews = await prisma.review.findMany({
      where: { eventId: eventIdNum },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ count: reviews.length, reviews });
  } catch (error) {
    console.error("listReviewsByEvent error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const deleteReview = async (req, res) => {
  try {
    //iau id-ul review-ului de sters din URL
    const idNum = Number(req.params.id);

    //valideza existenta si ca e nr pozitiv
    if (!idNum || Number.isNaN(idNum) || idNum <= 0) {
      return res.status(400).json({ error: "Invalid review id" });
    }

    const review = await prisma.review.findUnique({
      where: { id: idNum },
    });

    if (!review) {
      return res.status(404).json({ error: "Review is not found." });
    }

    //definesc cine e autorizat sa stearga, execut stergerea din DB si returnez rezultatul
    const isAdmin = req.user.role === "ADMIN";
    const isOwner = review.userId === req.user.id;

    await prisma.review.delete({
      where: { id: idNum },
    });

    return res.json({ message: "Review deleted." });
  } catch (error) {
    console.error("deleteReview error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

export const listAllReviews = async (req, res) => {
  try {
    //vreau sa extrag toate review-urile din DB
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        event: { select: { id: true, title: true } },
      },
    });

    res.json({ count: reviews.length, reviews });
  } catch (error) {
    console.error("listAllReviews error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
