import cloudinary from "../config/cloudinary.js";

//POST --> upload an image for events
export const uploadImage = async (req, res) => {
  try {
    //in server.js am importat functia fileUpload din libraria expres-fileupload
    //ea are rolul de a pune orice fisier in req.files
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const file = req.files.image;

    //fac o validare minima ca sa ma asigur ca fisierul trimis e imagine
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "File must be an image!" });
    }

    //aici fac upload-ul in Cloudinary per se, cu imagini venite din Postman sau din frontend
    //practic in DB voi salva doar URL-ul imaginii, aceasta fiind uploadata direct in cloud, prin intermediul aceste functii din backend
    //useTemFiles: true(din server.js) ceea ce face ca file.temFilePath sa poata fi folosit
    //file.temFilePath
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "events",
      resource_type: "image",
    });

    return res.status(201).json({
      message: "Image has been uploaded successfully!",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("uploadImage error: ", error);
    return res.status(500).json({ error: "Server error." });
  }
};
