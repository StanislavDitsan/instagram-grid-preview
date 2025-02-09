import { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaTrashAlt, FaUpload, FaSearch } from "react-icons/fa";

// Simple Spinner Component
const Spinner = () => (
  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto my-4"></div>
);

export default function Home() {
  const [username, setUsername] = useState("");
  const [gridImages, setGridImages] = useState([]);
  const [showDelete, setShowDelete] = useState(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const fetchPosts = async () => {
    if (!username.trim()) {
      setErrorMessage("Please enter an Instagram username!");
      setShowModal(true);
      return;
    }

    setIsLoading(true); // Set loading to true while fetching
    try {
      const response = await axios.get(`/api/fetchPosts?username=${username}`);
      if (response.data.length === 0) {
        setErrorMessage("Username not found, please check the username.");
        setShowModal(true);
        setIsLoading(false); // Set loading to false after fetching
        return;
      }

      const fetchedPosts = response.data.map((post) => ({
        id: post.id,
        imageUrl: post.imageUrl || "",
        isUploaded: false,
      }));

      // Merge previously uploaded images with fetched posts
      setGridImages((prev) => {
        const uploadedImages = prev.filter((img) => img.isUploaded);
        const mergedImages = [...uploadedImages, ...fetchedPosts];
        return mergedImages.slice(0, 12); // Ensure you have only 12 images in the grid
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        "It seems the username is incorrect. Please double-check and try again."
      );
      setShowModal(true);
    } finally {
      setIsLoading(false); // Set loading to false after the operation completes
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newImages = files.map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      imageUrl: URL.createObjectURL(file),
      isUploaded: true,
    }));

    setUploadCount((prev) => prev + files.length);

    setGridImages((prev) => {
      // Add new images to the front and slice the array to 12 items
      const updatedImages = [...newImages, ...prev];
      return updatedImages.slice(0, 12); // Keep only the first 12 images
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const uploadedImages = gridImages.filter((img) => img.isUploaded);
    const fetchedImages = gridImages.filter((img) => !img.isUploaded);

    const [reorderedItem] = uploadedImages.splice(result.source.index, 1);
    uploadedImages.splice(result.destination.index, 0, reorderedItem);

    setGridImages([...uploadedImages, ...fetchedImages]);
  };

  const handleDelete = (id) => {
    setGridImages((prev) => {
      const updatedImages = prev.filter((image) => image.id !== id);
      setUploadCount(updatedImages.filter((img) => img.isUploaded).length);
      return updatedImages;
    });
  };

  const handleImageTap = (id) => {
    setShowDelete((prevState) => (prevState === id ? null : id));
    setTimeout(() => {
      setShowDelete(null);
    }, 5000);
  };

  const watchAd = () => {
    alert("Thanks for watching the ad! You can now upload more images.");
    setUploadCount(0); // Reset upload count after watching the ad
  };

  const closeModal = () => {
    setShowModal(false);
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
          {isLoading && <Spinner />} {/* Display spinner while loading */}
        </div>
        {/* {uploadCount >= 3 && (
          <div className="mt-4 p-4 bg-yellow-200 dark:bg-red-600 rounded-md text-center">
            <p className="text-lg font-mono text-balance">
              You have uploaded 3 images. Please watch an ad to upload more.
            </p>
            <button
              onClick={watchAd}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-mono dark:bg-blue-700 w-full"
            >
              Watch Ad
            </button>
          </div>
        )} */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="uploadedImages" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-3 mt-4"
              >
                {gridImages.map((img, index) =>
                  img.isUploaded ? (
                    <Draggable key={img.id} draggableId={img.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative cursor-grab active:cursor-grabbing"
                          onClick={() => handleImageTap(img.id)}
                        >
                          <img
                            src={img.imageUrl}
                            alt={`Image ${index}`}
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
                  ) : (
                    <div key={img.id} className="relative">
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(
                          img.imageUrl
                        )}`}
                        alt={`Image ${index}`}
                        className="w-full aspect-square object-cover border border-black"
                      />
                    </div>
                  )
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <a
        className="text-sm mt-3"
        href="https://digitelle-studios.com/"
        target="_blank"
      >
        Developed by{" "}
        <span className="text-blue-500 hover:text-blue-700">
          digitelle-studios.com
        </span>
      </a>

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
