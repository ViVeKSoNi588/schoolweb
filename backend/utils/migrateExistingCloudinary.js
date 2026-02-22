/* eslint-env node */
/* global process */

/**
 * Migration Script for Existing Cloudinary Images and Videos
 * 
 * Use this if you already have images/videos in Cloudinary and want to:
 * 1. Link them to your database records
 * 2. Generate optimized size URLs
 * 
 * Usage:
 *   node backend/utils/migrateExistingCloudinary.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Gallery from '../models/Gallery.js';
import Image from '../models/Image.js';
import Video from '../models/Video.js';
import VideoGallery from '../models/VideoGallery.js';
import { getResponsiveUrls, getResponsiveVideoUrls } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Extract Cloudinary public_id from URL
const extractPublicId = (cloudinaryUrl) => {
  try {
    // Example URL: https://res.cloudinary.com/dmefbwrme/image/upload/v1234567890/schoolweb/folder/image.jpg
    const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (match) {
      return match[1]; // Returns: schoolweb/folder/image
    }
    return null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

// Check if URL is a Cloudinary URL
const isCloudinaryUrl = (url) => {
  return url && (
    url.includes('res.cloudinary.com') || 
    url.includes('cloudinary.com')
  );
};

// Migrate Gallery images
const migrateGalleryImages = async () => {
  console.log('\n📸 Migrating Gallery images...\n');
  
  // Find all gallery images with cloudinary URLs but no cloudinaryId
  const images = await Gallery.find({
    src: { $regex: 'cloudinary.com' },
    cloudinaryId: { $exists: false }
  });

  console.log(`Found ${images.length} gallery images to migrate`);

  let migrated = 0;
  for (const image of images) {
    try {
      const publicId = extractPublicId(image.src);
      if (publicId) {
        // Generate responsive URLs
        const urls = getResponsiveUrls(publicId);
        
        // Update database
        image.cloudinaryId = publicId;
        image.cloudinaryUrls = urls;
        await image.save();
        
        console.log(`✅ Migrated: ${image.title} (${publicId})`);
        migrated++;
      } else {
        console.log(`⚠️  Could not extract public_id from: ${image.src}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${image.title}:`, error.message);
    }
  }

  console.log(`\n✅ Migrated ${migrated}/${images.length} gallery images\n`);
  return migrated;
};

// Migrate Carousel images
const migrateCarouselImages = async () => {
  console.log('\n🎠 Migrating Carousel images...\n');
  
  const images = await Image.find({
    src: { $regex: 'cloudinary.com' },
    cloudinaryId: { $exists: false }
  });

  console.log(`Found ${images.length} carousel images to migrate`);

  let migrated = 0;
  for (const image of images) {
    try {
      const publicId = extractPublicId(image.src);
      if (publicId) {
        const urls = getResponsiveUrls(publicId);
        
        image.cloudinaryId = publicId;
        image.cloudinaryUrls = urls;
        await image.save();
        
        console.log(`✅ Migrated: ${image.title} (${publicId})`);
        migrated++;
      } else {
        console.log(`⚠️  Could not extract public_id from: ${image.src}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${image.title}:`, error.message);
    }
  }

  console.log(`\n✅ Migrated ${migrated}/${images.length} carousel images\n`);
  return migrated;
};

// Migrate Video Gallery videos
const migrateVideoGalleryVideos = async () => {
  console.log('\n🎥 Migrating Video Gallery videos...\n');
  
  const videos = await VideoGallery.find({
    src: { $regex: 'cloudinary.com' },
    cloudinaryId: { $exists: false }
  });

  console.log(`Found ${videos.length} gallery videos to migrate`);

  let migrated = 0;
  for (const video of videos) {
    try {
      const publicId = extractPublicId(video.src);
      if (publicId) {
        const urls = getResponsiveVideoUrls(publicId);
        
        video.cloudinaryId = publicId;
        video.cloudinaryUrls = urls;
        // Set thumbnail from Cloudinary if not already set
        if (!video.thumbnail) {
          video.thumbnail = urls.thumbnail;
        }
        await video.save();
        
        console.log(`✅ Migrated: ${video.title} (${publicId})`);
        migrated++;
      } else {
        console.log(`⚠️  Could not extract public_id from: ${video.src}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${video.title}:`, error.message);
    }
  }

  console.log(`\n✅ Migrated ${migrated}/${videos.length} gallery videos\n`);
  return migrated;
};

// Migrate Carousel videos
const migrateCarouselVideos = async () => {
  console.log('\n🎬 Migrating Carousel videos...\n');
  
  const videos = await Video.find({
    src: { $regex: 'cloudinary.com' },
    cloudinaryId: { $exists: false }
  });

  console.log(`Found ${videos.length} carousel videos to migrate`);

  let migrated = 0;
  for (const video of videos) {
    try {
      const publicId = extractPublicId(video.src);
      if (publicId) {
        const urls = getResponsiveVideoUrls(publicId);
        
        video.cloudinaryId = publicId;
        video.cloudinaryUrls = urls;
        // Set thumbnail from Cloudinary if not already set
        if (!video.thumbnail) {
          video.thumbnail = urls.thumbnail;
        }
        await video.save();
        
        console.log(`✅ Migrated: ${video.title} (${publicId})`);
        migrated++;
      } else {
        console.log(`⚠️  Could not extract public_id from: ${video.src}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${video.title}:`, error.message);
    }
  }

  console.log(`\n✅ Migrated ${migrated}/${videos.length} carousel videos\n`);
  return migrated;
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting Cloudinary Migration...\n');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI}\n`);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Run migrations
    const galleryCount = await migrateGalleryImages();
    const carouselCount = await migrateCarouselImages();
    const videoGalleryCount = await migrateVideoGalleryVideos();
    const carouselVideoCount = await migrateCarouselVideos();

    // Summary
    console.log('=' .repeat(50));
    console.log('📊 Migration Summary:');
    console.log('=' .repeat(50));
    console.log(`Gallery Images: ${galleryCount} migrated`);
    console.log(`Carousel Images: ${carouselCount} migrated`);
    console.log(`Gallery Videos: ${videoGalleryCount} migrated`);
    console.log(`Carousel Videos: ${carouselVideoCount} migrated`);
    console.log(`Total: ${galleryCount + carouselCount + videoGalleryCount + carouselVideoCount} migrated`);
    console.log('=' .repeat(50));
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { migrateGalleryImages, migrateCarouselImages, migrateVideoGalleryVideos, migrateCarouselVideos, extractPublicId, isCloudinaryUrl };
