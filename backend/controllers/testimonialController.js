import prisma from "../utils/prismaClient.js";

//GET --> listam testimonialele din DB
export const listTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({ count: testimonials.length, testimonials });
  } catch (error) {
    console.error("listTestimonials error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//POST --> creez un testimonial doar daca sunt ADMIN
export const createTestimonial = async (req, res) => {
  try {
    const { name, roleLabel, message, rating } = req.body;

    //validez campurile obligatorii (conform schema.prisma)
    if (!name || !message) {
      return res.status(400).json({ error: "name and message are required!" });
    }

    //validez rating-ul fiind optional. ma asigur ca e transaformat din String in Int
    let ratingNum;
    if (rating !== "" && rating !== null && rating !== undefined) {
      ratingNum = Number(rating);
      if (ratingNum < 1 || ratingNum > 5 || Number.isNaN(ratingNum)) {
        return res
          .status(400)
          .json({ error: "Rating must be Between 1 and 5 stars!" });
      }
    }

    //creez in DB testimonialul
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        roleLabel: roleLabel || null,
        message,
        rating: ratingNum,
      },
    });

    return res
      .status(201)
      .json({ message: "Testimonial has been created.", testimonial });
  } catch (error) {
    console.error("createTestimonial error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};

//DELETE --> sterg testimonial in baza id-ului lor (cheii lor primare), care apare in URL
export const deleteTestimonial = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0 || !id) {
      return res.status(400).json({ error: "Incorrect testimonial id." });
    }

    const exists = await prisma.testimonial.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      return res.status(400).json({ error: "Testimonial has not been found." });
    }

    await prisma.testimonial.delete({ where: { id } });

    return res.json({ message: "Testimonial deleted successfully." });
  } catch (error) {
    console.error("deleteTestimonial error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
