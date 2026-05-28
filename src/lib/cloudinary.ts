import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * আপলোড ফাংশন: এটি একটি ইমেজ ফাইলকে বাফার থেকে ক্লাউডিনারিতে আপলোড করে।
 */
export const uploadImage = async (file: File): Promise<UploadApiResponse> => {
  // ফাইলটিকে বাফারে রূপান্তর করা
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "socksful", // ক্লাউডিনারিতে SocksFul ফোল্ডারে সেভ হবে
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(
            new Error("Cloudinary returned an empty upload result"),
          );
        }

        resolve(result);
      },
    );

    // বাফারটি স্ট্রিমে পুশ করা
    uploadStream.end(buffer);
  });
};

export default cloudinary;
