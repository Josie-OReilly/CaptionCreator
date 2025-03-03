const fs = require('fs');
const path = require('path');

// Path to your folder of images
const IMAGES_DIR = path.join(__dirname, 'CaptionImages');

// Path to your JSON output file
const OUTPUT_JSON = path.join(__dirname, 'images.json');

// Optional: Provide a function to derive a caption from the filename
// For example, remove file extension and replace hyphens/underscores with spaces.
function deriveCaption(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace underscores or hyphens with spaces
  const caption = nameWithoutExt.replace(/[-_]/g, ' ');
  return caption;
}

// Read all files in CaptionImages folder
fs.readdir(IMAGES_DIR, (err, files) => {
  if (err) {
    console.error('Error reading image directory:', err);
    process.exit(1);
  }

  // Filter out any non-image files if needed
  const validExtensions = /\.(jpe?g|png|gif|webp|svg)$/i;
  const imageFiles = files.filter(file => validExtensions.test(file));

  // Build an array of objects for each image with their modification time
  let imageData = imageFiles.map(file => {
    const filePath = path.join(IMAGES_DIR, file);
    const stats = fs.statSync(filePath);
    return {
      filename: file,
      caption: deriveCaption(file),
      // Store modification time for sorting
      mtime: stats.mtime
    };
  });

  // Sort images in ascending order (oldest first) based on modification time
  imageData.sort((a, b) => a.mtime - b.mtime);

  // Remove the mtime property if it's not needed in the JSON output
  imageData = imageData.map(({ filename, caption }) => ({ filename, caption }));

  // Write the array to images.json
  fs.writeFile(OUTPUT_JSON, JSON.stringify(imageData, null, 2), (err) => {
    if (err) {
      console.error('Error writing images.json:', err);
      process.exit(1);
    }
    console.log('images.json has been updated in date order!');
  });
});