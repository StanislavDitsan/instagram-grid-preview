import axios from "axios";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    // Fetch the image from the Instagram CDN
    const response = await axios.get(url, {
      responseType: "arraybuffer", // Fetch the image as a binary buffer
    });

    // Set the appropriate headers for the image
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache the image for 1 year
    res.send(response.data); // Send the image data
  } catch (error) {
    console.error("Failed to fetch image:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
}
