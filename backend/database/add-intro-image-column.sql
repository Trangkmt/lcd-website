-- Add intro_image column to categories table if it doesn't exist
ALTER TABLE categories ADD COLUMN intro_image VARCHAR(500) AFTER description;

-- Update existing category with sample image
UPDATE categories SET intro_image = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
WHERE slug = 'thuong-nien';
