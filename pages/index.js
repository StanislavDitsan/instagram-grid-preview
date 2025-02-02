import { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrashAlt, FaUpload, FaSearch } from "react-icons/fa"; // Import icons from react-icons

export default function Home() {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showDelete, setShowDelete] = useState(null); // State to control visibility of delete button
  const [canUpload, setCanUpload] = useState(true); // State to control if user can upload more images
  const [uploadCount, setUploadCount] = useState(0); // Track number of uploaded images
  const [errorMessage, setErrorMessage] = useState(""); // Track error message
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const fetchPosts = async () => {
    if (!username.trim()) {
      setErrorMessage("Please enter an Instagram username!"); // Show warning if username is empty
      setShowModal(true); // Show modal with warning message
      return;
    }

    try {
      const response = await axios.get(`/api/fetchPosts?username=${username}`);
      if (response.data.length === 0) {
        setErrorMessage("Username not found, please check the username."); // Show warning if username is invalid
        setShowModal(true);
        return;
      }
      const fetchedPosts = response.data.map((post) => ({
        id: post.id,
        imageUrl: post.imageUrl || "",
      }));
      setPosts(fetchedPosts.slice(0, 9));
      setErrorMessage(""); // Clear error message if successful
    } catch (error) {
      setErrorMessage(
        "It seems the username is incorrect. Please double-check and try again."
      ); // Show general error message for server errors
      setShowModal(true); // Show modal for error
    }
  };

  const handleImageUpload = (e) => {
    if (!canUpload) return; // Prevent upload if user can't upload more images

    const files = Array.from(e.target.files).slice(0, 3);
    const newImages = files.map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      imageUrl: URL.createObjectURL(file),
    }));

    // Update upload count and uploaded images
    setUploadCount((prev) => prev + files.length);
    setUploadedImages((prev) => [...prev, ...newImages].slice(0, 9));

    // Disable further uploads once 3 images are uploaded
    if (uploadCount + files.length >= 3) {
      setCanUpload(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(uploadedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setUploadedImages(items);
  };

  const handleDelete = (id) => {
    setUploadedImages((prev) => prev.filter((image) => image.id !== id));
    setUploadCount((prev) => prev - 1); // Decrement the upload count when deleting
  };

  const handleImageTap = (id) => {
    setShowDelete((prevState) => (prevState === id ? null : id));

    setTimeout(() => {
      setShowDelete(null); // Hide the delete button after 3 seconds
    }, 5000); // 5-second delay
  };

  const watchAd = () => {
    // Simulate watching an ad
    alert("Thanks for watching the ad! You can now upload more images.");
    setCanUpload(true); // Allow image uploads after watching the ad
    setUploadCount(0); // Reset upload count after ad
  };

  const closeModal = () => {
    setShowModal(false); // Close the error modal
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-2 flex flex-col items-center text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-mono text-black dark:text-white mt-1 mb-1 pt-2">
        Instagram Grid Preview
      </h1>
      <div className="w-full max-w-md bg-white dark:bg-gray-950 p-6 rounded-xl shadow-lg">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Enter Instagram username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono dark:bg-gray-900 dark:text-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
        )}
        <button
          onClick={fetchPosts}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-md transition duration-300 flex items-center justify-center font-mono dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <FaSearch className="mr-2" />
          Load Posts
        </button>
        <div className="mt-4">
          <label className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-md transition duration-300 cursor-pointer font-mono dark:bg-blue-700 dark:hover:bg-blue-800">
            <FaUpload className="mr-2" />
            Upload Images
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>

        {/* Show the ad prompt if the user has uploaded 3 images */}
        {!canUpload && (
          <div className="mt-4 p-4 bg-yellow-200 dark:bg-red-600 rounded-md text-center">
            <p className="text-lg font-mono text-balance">
              Please watch an ad to upload 3 more images
            </p>
            <button
              onClick={watchAd}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-mono dark:bg-blue-700 w-full"
            >
              Watch Ad
            </button>
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="uploadedImages" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-3 mt-4"
              >
                {uploadedImages.map((img, index) => (
                  <Draggable key={img.id} draggableId={img.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative cursor-grab active:cursor-grabbing"
                        onClick={() => handleImageTap(img.id)} // Trigger tap to show delete button
                      >
                        <img
                          src={img.imageUrl}
                          alt={`Uploaded ${index}`}
                          className="w-full aspect-square object-cover border border-black"
                        />
                        {showDelete === img.id && (
                          <button
                            onClick={() => handleDelete(img.id)}
                            className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full shadow-md hover:bg-red-500 hover:text-white opacity-100 transition-opacity"
                          >
                            <FaTrashAlt className="dark:text-black" />
                          </button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="grid grid-cols-3">
          {posts.slice(0, 9).map((post, index) => (
            <img
              key={post.id}
              src={`/api/image-proxy?url=${encodeURIComponent(post.imageUrl)}`}
              alt={`Post ${index}`}
              className="w-full aspect-square object-cover border border-black"
            />
          ))}
        </div>
      </div>

      {/* Modal for error */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80 text-center">
            <p className="text-red-500 mb-4 font-mono">{errorMessage}</p>
            <button
              onClick={closeModal}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-mono dark:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
