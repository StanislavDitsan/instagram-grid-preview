import axios from "axios";

// Ensure that dotenv is imported if you are using environment variables
require("dotenv").config();

export default async function handler(req, res) {
  const { username } = req.query;

  // Check if username is provided
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const response = await axios.get(
      "https://instagram-scraper-api2.p.rapidapi.com/v1/posts",
      {
        params: { username_or_id_or_url: username },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Use the API key from environment variables
          "x-rapidapi-host": process.env.RAPIDAPI_HOST, // Use the API host from environment variables
        },
      }
    );

    console.log("Full API Response:", response.data); // Log the full response

    // Check if the response contains the expected data
    if (!response.data.data || !Array.isArray(response.data.data.items)) {
      return res.status(500).json({ error: "Unexpected API response format" });
    }

    // Extract relevant data from the posts
    const posts = response.data.data.items.map((post) => ({
      id: post.id,
      imageUrl: post.image_versions?.items?.[0]?.url || "", // Use the correct field
      caption: post.caption?.text || "No caption",
    }));

    res.status(200).json(posts); // Return the posts to the client
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}
